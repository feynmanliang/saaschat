import csv from "~/Sagient Customer service tools - Sheet1.csv?raw";
import Papa from 'papaparse';

function transpose(a) {
    // Calculate the width and height of the Array
    var w = a.length || 0;
    var h = a[0] instanceof Array ? a[0].length : 0;

    // In case it is a zero matrix, no transpose routine needed.
    if (h === 0 || w === 0) { return []; }

    /**
     * @var {Number} i Counter
     * @var {Number} j Counter
     * @var {Array} t Transposed data is stored in this array.
     */
    var i, j, t = [];

    // Loop through every item in the outer array (height)
    for (i = 0; i < h; i++) {

        // Insert a new row (array)
        t[i] = [];

        // Loop through every item per item in outer array (width)
        for (j = 0; j < w; j++) {

            // Save transposed data.
            t[i][j] = a[j][i];
        }
    }

    return t;
}

function prepareKnowledgeBase(csvString: string) {
    const transposedData = transpose(Papa.parse(csvString).data);

    const headerRows = [...Array(transposedData[0].length).keys()].map((i) => {
        if (i == 0) {
            return '1 - Name';
        } else {
            if (transposedData[2][i]) {
                return `${i + 1} - ${transposedData[2][i]}`;
            } else if (transposedData[1][i]) {
                return `${i + 1} - ${transposedData[1][i]}`;
            } else {
                return `${i + 1} - ${transposedData[0][i]}`;
            }
        }
    });

    const products = Papa.parse(Papa.unparse([headerRows].concat(transposedData.slice(3))), {
        header: true
    })
        .data
        .map((product) => {
            return Object.fromEntries(
                Object.entries(product)
                    .filter(([, v]) => v != '')
                    .map(([k, v]) => [k.split("- ").slice(-1)[0], v])
            )
        })
    return products;
}

export const products = prepareKnowledgeBase(csv);