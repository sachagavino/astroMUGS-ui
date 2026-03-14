from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import traceback

from astromugs.modeling import Interface

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

class WriteContinuumRequest(BaseModel):
    thermal_path: str
    flags: WriteContinuumFlags
    disk: Optional[DiskParams] = None
    envelope: Optional[EnvelopeParams] = None
    star: Optional[StarParams] = None
    grid: Optional[GridParams] = None

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

        # Set up grid (required for write_continuum)
        # rin/rout come from disk params (model.params.disk.rin / .rout)
        model.grid.set_wavelength_grid(
            model.thermalparams.wave.lmin,
            model.thermalparams.wave.lmax,
            model.thermalparams.wave.na,
            log=True,
        )
        model.grid.set_mcmonowavelength_grid(
            model.thermalparams.wave.lmin_mono,
            model.thermalparams.wave.lmax_mono,
            model.thermalparams.wave.na_mono,
            log=True,
        )
        model.grid.set_spherical_grid()

        # Add star so stars.inp can be written
        model.add_star()

        # Call write_continuum with the checkbox flags
        flags = req.flags.model_dump()
        model.write_continuum(**flags)

        return {"status": "ok", "message": "write_continuum completed successfully"}

    except Exception as e:
        return {"status": "error", "message": str(e), "traceback": traceback.format_exc()}
