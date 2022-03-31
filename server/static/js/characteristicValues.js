//================================Initialize data================================
var characteristicValues_elements = {
    'soundGraph': {
        globalMinimum: null,
        visibleMinimum: null,
        globalMaximum: null,
        visibleMaximum: null,
        globalAverage: null,
        visibleAverage: null
    },

    'lightGraph': {
        globalMinimum: null,
        visibleMinimum: null,
        globalMaximum: null,
        visibleMaximum: null,
        globalAverage: null,
        visibleAverage: null
    }
}

var characteristicValues_global = {
    'soundGraph': {
        globalMinimum: null,
        globalMaximum: null,
        globalAverage: null,
    },

    'lightGraph': {
        globalMinimum: null,
        globalMaximum: null,
        globalAverage: null,
    }
}


var characteristicValues_visible = {
    'soundGraph': {
        visibleMinimum: null,
        visibleMaximum: null,
        visibleAverage: null,
    },

    'lightGraph': {
        visibleMinimum: null,
        visibleMaximum: null,
        visibleAverage: null,
    }

}


//================================Bind elements================================
var soundGraphValues_elements = document.querySelectorAll('#soundGraphWrapper .graphDescription p span');
var lightGraphValues_elements = document.querySelectorAll('#lightGraphWrapper .graphDescription p span');

for (key in soundGraphValues_elements) {
    let characteristic = soundGraphValues_elements[key].title;
    characteristicValues_elements.soundGraph[characteristic] = soundGraphValues_elements[key];
}

for (key in lightGraphValues_elements) {
    let characteristic = lightGraphValues_elements[key].title;
    characteristicValues_elements.lightGraph[characteristic] = lightGraphValues_elements[key];
}


//================================Characteristic values calculation================================
function valuesCalculation(data) {
    let minimum = Math.min(...data);
    let maximum = Math.max(...data);
    let sum = 0;
    data.forEach(element => {
        sum += element;
    });

    return {
        data,
        minimum,
        maximum,
        sum: parseFloat(sum.toFixed(2))
    }
}

async function calculateCharacteristicValues(data, visibleData, graph) {
    data = data.map(element => parseFloat(element))

    let valuesGlobal = valuesCalculation(data);
    let valuesVisible = valuesCalculation(visibleData);
    let averageGlobal = parseFloat((valuesGlobal.sum / data.length).toFixed(2));
    let averageVisible = parseFloat((valuesVisible.sum / visibleData.length).toFixed(2));


    //Update values on new data generation
    if (graph == 'sound') {
        characteristicValues_global.soundGraph.globalMinimum = valuesGlobal.minimum;
        characteristicValues_global.soundGraph.globalMaximum = valuesGlobal.maximum;
        characteristicValues_global.soundGraph.globalAverage = averageGlobal;

        characteristicValues_visible.soundGraph.visibleMinimum = valuesVisible.minimum;
        characteristicValues_visible.soundGraph.visibleMaximum = valuesVisible.maximum;
        characteristicValues_visible.soundGraph.visibleAverage = averageVisible;

        updateCharacteristicValues('soundGraph');
        window.localStorage.setItem('soundGraph_characteristicValuesGlobal', JSON.stringify(valuesGlobal));
    } else {
        characteristicValues_global.lightGraph.globalMinimum = valuesGlobal.minimum;
        characteristicValues_global.lightGraph.globalMaximum = valuesGlobal.maximum;
        characteristicValues_global.lightGraph.globalAverage = averageGlobal;

        characteristicValues_visible.lightGraph.visibleMinimum = valuesVisible.minimum;
        characteristicValues_visible.lightGraph.visibleMaximum = valuesVisible.maximum;
        characteristicValues_visible.lightGraph.visibleAverage = averageVisible;

        updateCharacteristicValues('lightGraph');
        window.localStorage.setItem('lightGraph_characteristicValuesGlobal', JSON.stringify(valuesGlobal));
    }
}

//Apply calculated values to corresponding elements
function updateCharacteristicValues(graph) {
    for (param in characteristicValues_global[graph]) {
        characteristicValues_elements[graph][param].innerHTML = characteristicValues_global[graph][param];
    }

    for (param in characteristicValues_visible[graph]) {
        characteristicValues_elements[graph][param].innerHTML = characteristicValues_visible[graph][param];
    }

}