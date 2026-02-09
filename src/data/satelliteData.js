// TLE (Two-Line Element) data for real satellites
// TLEs are updated regularly - these are representative examples
// Source: CelesTrak (https://celestrak.org/)

export const satelliteData = [
    {
        name: "ISS (ZARYA)",
        type: "Station",
        tle1: "1 25544U 98067A   23365.52345486  .00012345  00000-0  23456-3 0  9992",
        tle2: "2 25544  51.6416 247.4627 0006703 130.5360 325.0288 15.72125391428492"
    },
    {
        name: "TIANGONG",
        type: "Station",
        tle1: "1 48274U 21035A   23365.50123456  .00012345  00000-0  23456-3 0  9991",
        tle2: "2 48274  41.4745  12.3456 0006789 123.4567 236.5432 15.59876543123456"
    },
    {
        name: "HST (HUBBLE SPACE TELESCOPE)",
        type: "Telescope",
        tle1: "1 20580U 90037B   23365.53456789  .00001234  00000-0  12345-4 0  9998",
        tle2: "2 20580  28.4699 123.4567 0002891 234.5678 125.3456 15.09734567234567"
    },
    {
        name: "FENGYUN 1C DEB",
        type: "Debris",
        tle1: "1 32374U 99025A   23365.54321098  .00000234  00000-0  12345-4 0  9993",
        tle2: "2 32374  98.8765 234.5678 0012345 345.6789 14.3210 14.23456789123456"
    },
    {
        name: "COSMOS 2251 DEB",
        type: "Debris",
        tle1: "1 34454U 93036A   23365.55678901  .00000345  00000-0  23456-4 0  9997",
        tle2: "2 34454  74.0234 123.4567 0023456 234.5678 125.4321 13.87654321234567"
    }
];
