# astroMUGS-UI

[![astroMUGS-UI](https://img.shields.io/badge/astroMUGS--UI-green?style=flat-square&logo=pypi&logoColor=FFFFFF&labelColor=3A3B3C&color=62F1CD)](https://github.com/sachagavino/astromugs-ui)
[![Python](https://img.shields.io/pypi/pyversions/uv.svg)](https://github.com/sachagavino/astromugs-ui)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

A visual node-based interface for building [astroMUGS](https://github.com/sachagavino/astroMUGS) pipelines.

![astroMUGS-UI Screenshot](docs/screenshot.png)

## Overview

**astroMUGS-UI** provides an intuitive drag-and-drop interface for constructing multi-grain simulation pipelines. Instead of writing code, users can visually connect nodes representing different stages of the astroMUGS workflow:

- 📥 **Data loaders** — Import RADMC3D outputs, simulation files, or custom datasets
- ⚙️ **Processing nodes** — Transform coordinates, interpolate grids, configure chemistry
- 📊 **Analysis nodes** — Run NAUTILUS, generate synthetic observations
- 📈 **Visualization outputs** — Plot results, export to various formats

## Features

- **Visual Pipeline Builder** — Drag, drop, and connect nodes to build complex workflows
- **Local-First** — Works with your local data files, no cloud upload required
- **Real-Time Feedback** — See pipeline status and results as they execute
- **Export Pipelines** — Save and share your workflows as reproducible configurations

## Installation

### Prerequisites

- Python 3.9 or higher
- Node.js 18+ (for development only)
- [astroMUGS](https://github.com/sachagavino/astroMUGS) library

### Install from PyPI

```bash
pip install astromugs-ui
```

### Install from Source

```bash
git clone https://github.com/sachagavino/astromugs-ui.git
cd astromugs-ui
pip install -e .
```

## Quick Start

Launch the interface with a single command:

```bash
astromugs-ui launch
```

This will:
1. Start the backend server (FastAPI)
2. Start the frontend server (React)
3. Open your browser to the interface

By default, the UI runs at `http://localhost:3000`.

## Usage

### Building a Pipeline

1. **Add nodes** — Drag nodes from the sidebar onto the canvas
2. **Connect nodes** — Click and drag from output handles to input handles
3. **Configure nodes** — Click a node to edit its parameters
4. **Run pipeline** — Click the "Run" button to execute

### Example Workflow

```