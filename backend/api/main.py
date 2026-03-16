from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import traceback
import base64
import io

from astromugs.modeling import Interface
from astromugs.dust import CustomDistrib, MRNDistrib

app = FastAPI(title="astroMUGS UI backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------- Pydantic models ---------------

class DiskParams(BaseModel):
    rin: Optional[float] = None
    rout: Optional[float] = None
    ref_radius: Optional[float] = None
    p_exp: Optional[float] = None
    sigma_gas_ref: Optional[float] = None
    sigma_compute: Optional[str] = None
    sigma_path: Optional[str] = None
    h0: Optional[float] = None
    q_exp: Optional[float] = None
    tmidplan_ref: Optional[float] = None
    tatmos_ref: Optional[float] = None
    sigma_t: Optional[float] = None
    max_H: Optional[float] = None
    isothermal: Optional[bool] = None
    disk_mass: Optional[float] = None
    dust_mass: Optional[float] = None
    dtogas: Optional[float] = None
    d_exp: Optional[float] = None
    rho_m: Optional[float] = None
    settling: Optional[bool] = None
    settfact: Optional[float] = None
    schmidtnumber: Optional[float] = None
    q_c: Optional[float] = None
    acc_rate: Optional[float] = None
    alpha: Optional[float] = None
    lim_h: Optional[float] = None
    star_mass: Optional[float] = None
    nr: Optional[int] = None
    ntheta: Optional[int] = None
    nphi: Optional[int] = None
    nz_chem: Optional[int] = None
    coordsystem: Optional[str] = None

class EnvelopeParams(BaseModel):
    rmin: Optional[float] = None
    rmax: Optional[float] = None
    r_centri: Optional[float] = None
    acc_rate: Optional[float] = None
    dtogas: Optional[float] = None
    dust_env_mass: Optional[float] = None
    cavpl: Optional[float] = None
    cavz0: Optional[float] = None
    cav_fact: Optional[float] = None
    coordsystem: Optional[str] = None

class StarParams(BaseModel):
    mass: Optional[float] = None
    temperature: Optional[float] = None
    luminosity: Optional[float] = None
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None

class WriteContinuumFlags(BaseModel):
    dens: bool = False
    grid: bool = False
    opac: bool = False
    control: bool = False
    stars: bool = False
    wave: bool = False
    mcmono: bool = False
    ext: bool = False

class GridParams(BaseModel):
    nr: Optional[int] = None
    ntheta: Optional[int] = None
    nphi: Optional[int] = None
    coordsystem: Optional[str] = None

class WavelengthGridParams(BaseModel):
    lmin: Optional[float] = None
    lmax: Optional[float] = None
    nlam: Optional[int] = None
    log: Optional[bool] = None

class McmonoWaveParams(BaseModel):
    lmin_mono: Optional[float] = None
    lmax_mono: Optional[float] = None
    nlam_mono: Optional[int] = None
    log_mono: Optional[bool] = None

class CustomDustParams(BaseModel):
    rsingle: Optional[float] = None
    rho_m: Optional[float] = None
    units: Optional[str] = None
    path: Optional[str] = None
    filename: Optional[str] = None

class MRNDustParams(BaseModel):
    rsingle: Optional[float] = None
    amin: Optional[float] = None
    amax: Optional[float] = None
    nb_sizes: Optional[int] = None
    d_exp: Optional[float] = None
    rho_m: Optional[float] = None
    dtogas: Optional[float] = None
    cst_norm: Optional[float] = None

class DustConfig(BaseModel):
    dust_type: Optional[str] = None  # "custom" or "mrn"
    custom_dust: Optional[CustomDustParams] = None
    mrn_dust: Optional[MRNDustParams] = None

class WriteContinuumRequest(BaseModel):
    thermal_path: str
    flags: WriteContinuumFlags
    disk: Optional[DiskParams] = None
    envelope: Optional[EnvelopeParams] = None
    star: Optional[StarParams] = None
    grid: Optional[GridParams] = None
    wavelength: Optional[WavelengthGridParams] = None
    mcmono_wave: Optional[McmonoWaveParams] = None
    dust: Optional[DustConfig] = None

# --------------- Endpoints ---------------

@app.post("/api/write-continuum")
def write_continuum(req: WriteContinuumRequest):
    """Execute write_continuum with the given flags and parameters."""
    try:
        model = Interface()
        thermal_path = req.thermal_path.strip()
        if not thermal_path.endswith('/'):
            thermal_path += '/'
        model.add_thermal_path(thermal_path)

        # Apply user-provided disk params
        if req.disk:
            for key, val in req.disk.model_dump(exclude_none=True).items():
                setattr(model.params.disk, key, val)

        # Apply user-provided envelope params
        if req.envelope:
            for key, val in req.envelope.model_dump(exclude_none=True).items():
                setattr(model.params.envelope, key, val)

        # Apply user-provided star params
        if req.star:
            for key, val in req.star.model_dump(exclude_none=True).items():
                setattr(model.thermalparams.star, key, val)

        # Apply user-provided grid params (nr, ntheta, nphi go into
        # model.params.disk where set_spherical_grid reads them;
        # coordsystem is set on model.grid directly)
        if req.grid:
            grid_vals = req.grid.model_dump(exclude_none=True)
            for key in ('nr', 'ntheta', 'nphi'):
                if key in grid_vals:
                    setattr(model.params.disk, key, grid_vals[key])
            if 'coordsystem' in grid_vals:
                setattr(model.params.disk, 'coordsystem', grid_vals['coordsystem'])

        # Apply user-provided wavelength grid params
        wave_log = True
        if req.wavelength:
            wv = req.wavelength.model_dump(exclude_none=True)
            for key in ('lmin', 'lmax', 'nlam'):
                if key in wv:
                    setattr(model.thermalparams.wave, key, wv[key])
            if 'log' in wv:
                wave_log = wv['log']

        # Apply user-provided mcmono wavelength params
        mcmono_log = True
        if req.mcmono_wave:
            mc = req.mcmono_wave.model_dump(exclude_none=True)
            for key in ('lmin_mono', 'lmax_mono', 'nlam_mono'):
                if key in mc:
                    setattr(model.thermalparams.wave, key, mc[key])
            if 'log_mono' in mc:
                mcmono_log = mc['log_mono']

        # Create dust model if provided
        dust_obj = None
        if req.dust and req.dust.dust_type:
            if req.dust.dust_type == 'custom' and req.dust.custom_dust:
                kw = req.dust.custom_dust.model_dump(exclude_none=True)
                dust_obj = CustomDistrib(**kw)
            elif req.dust.dust_type == 'mrn' and req.dust.mrn_dust:
                kw = req.dust.mrn_dust.model_dump(exclude_none=True)
                dust_obj = MRNDistrib(**kw)
            else:
                # Use default MRN distribution
                dust_obj = MRNDistrib()

        if dust_obj is None:
            # Always need at least one dust model for density writing
            dust_obj = MRNDistrib()

        model.grid.add_dust(dust_obj)

        # Set up grids (required for write_continuum)
        model.grid.set_wavelength_grid(log=wave_log)
        model.grid.set_mcmonowavelength_grid(log=mcmono_log)
        model.grid.set_spherical_grid()

        # Add disk structure with dust
        model.add_disk(dust=dust_obj)

        # Add star so stars.inp can be written
        model.add_star()

        # Call write_continuum with the checkbox flags
        flags = req.flags.model_dump()
        model.write_continuum(**flags)

        return {"status": "ok", "message": "write_continuum completed successfully"}

    except Exception as e:
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}


class PlotRequest(BaseModel):
    plot_type: str  # "density2D"
    path: str       # thermal path
    vmin: float = 1e-30
    vmax: float = 1e-15
    cmap: str = "gnuplot2"
    dens_type: str = "mass"


@app.post("/api/plot")
def generate_plot(req: PlotRequest):
    """Generate a plot and return it as base64 PNG."""
    try:
        import matplotlib
        matplotlib.use("Agg")
        from astromugs.plotting.plot import density2D_grid

        path = req.path.strip()
        if not path.endswith("/"):
            path += "/"

        # Call the static version — we capture the figure instead of showing it
        import matplotlib.pyplot as plt
        fig = plt.figure()
        plt.close(fig)  # close the empty one

        # Call density2D_grid which calls plt.show() internally;
        # we override plt.show to capture the figure
        figures = []
        original_show = plt.show

        def capture_show(*args, **kwargs):
            figures.append(plt.gcf())

        plt.show = capture_show
        try:
            density2D_grid(
                path=path,
                vmin=req.vmin,
                vmax=req.vmax,
                cmap=req.cmap,
                dens_type=req.dens_type,
            )
        finally:
            plt.show = original_show

        if not figures:
            return {"status": "error", "message": "No figure was generated"}

        fig = figures[0]
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150, bbox_inches="tight",
                    facecolor="#1a1a2e", edgecolor="none")
        plt.close(fig)
        buf.seek(0)
        img_b64 = base64.b64encode(buf.read()).decode("utf-8")

        return {"status": "ok", "image": f"data:image/png;base64,{img_b64}"}

    except Exception as e:
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}
