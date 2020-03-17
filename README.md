# hilbert-ip-viz
### Instructions for Running the visualization:
1. Clone repo
2. Obtain dataset tarball (dataset is not included here; please contact me for original
   version of dataset)
3. Unzip dataset tarball into the path `static/data` by running `mkdir
   static/data; tar -xzf data.tar.gz -C static/data`
4. To run application locally, run `python app.py`. This assumes your python
   version is python3.
5. See the application in the browser by navigating to 127.0.0.1:8001. Default
   port of 8001 can be changed in `app.py`

### List of sources:
- [Original Hilbert Map of IPv4 Address space in d3] (https://bl.ocks.org/vasturiano/8aceecba58f115c81853879a691fd94f)
- [d3 continuous color legend example] (https://observablehq.com/@tmcw/d3-scalesequential-continuous-color-legend-example)
- [d3 Legend library] (https://d3-legend.susielu.com/)
- [Data for rendering which AS an organization is in] (https://bl.ocks.org/vasturiano/8aceecba58f115c81853879a691fd94f)

