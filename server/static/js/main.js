//================================Initialize data================================ 
var DEFAULT_VALUES = {
    dotNumber: 60
}

var graphSettings = [
    soundGraphSettings = { dotNumber: DEFAULT_VALUES.dotNumber, description: 'sound' },
    lightGraphSettings = { dotNumber: DEFAULT_VALUES.dotNumber, description: 'light' }
]

var DATA = {
    sound: [],
    light: []
}

var lightToggle = false;
let lightIntensitySlider = document.getElementById('lightIntensity');
lightIntensitySlider.disabled = true;

let storageDotNumber = window.localStorage.getItem('soundGraphDotNumber');
if (storageDotNumber) {
    graphSettings[0].dotNumber = storageDotNumber;
}
storageDotNumber = window.localStorage.getItem('lightGraphDotNumber');
if (storageDotNumber) {
    graphSettings[1].dotNumber = storageDotNumber;
}

loadData('sound');
loadData('light');

//Bind event handlers to all charts
document.getElementById('soundGraph').onclick = graphEnableFullscreen;
document.getElementById('lightGraph').onclick = graphEnableFullscreen;

//Bind event handlers to all input elements
var sliderElements = document.getElementsByTagName('input');
for (key in sliderElements) {
    sliderElements[key].oninput = sliderChange;
}
// lightIntensitySlider.oninput = lightChange;

//Bind event handlers to all '<' '>' elements
var sliderArrowElements = document.querySelectorAll('.graphSettings span');
for (key in sliderArrowElements) {
    sliderArrowElements[key].onclick = sliderControlClick;
}

//Bind event handlers to apply changes buttons
var buttons = document.getElementsByClassName('applyChanges');
for (key in buttons) {
    
    let name = buttons[key].name;
    buttons[key].onclick = () => (saveGraphSettings(name))
}

var lightImgs = document.getElementsByClassName('lightSwitch');
for (key in lightImgs) {
    lightImgs[key].onclick = toggleLight;
}

var soundGraphExpandedFlag = false;
var lightGraphExpandedFlag = false;


//================================Apply settings to sliders and graphs on reload================================
modifySliderValues()

function modifySliderValues() {
    for (key in graphSettings) {
        let graph = graphSettings[key].description + 'Graph_';
        let elements = [ 'dotNumber', 'dotNumberOutput'];
        elements.forEach(element => {
            let property = element.replace('Output', '');
            document.getElementById(graph + element).value = graphSettings[key][property]/6;
        });
    }
};


//================================Dynamically change chart settings================================

//Change settings on slider change
function sliderChange() {
    let element = document.getElementById(this.id);
    let elementOutput = this.id + 'Output';
    document.getElementById(elementOutput).value = element.value;
    if (element==lightIntensitySlider) {
        lightChange();
    }
}

//Change settings on '<' '>' click
function sliderControlClick() {
    if (this.previousElementSibling) {
        let slider = this.previousElementSibling;
        slider.value = parseInt(slider.value) + parseInt(slider.step);
        let obj = { id: slider.id, change: sliderChange };
        obj.change();
    } else {
        let slider = this.nextElementSibling;
        slider.value = parseInt(slider.value) - parseInt(slider.step);
        let obj = { id: slider.id, change: sliderChange };
        obj.change();
    }
}


//================================Save modified settings for chart================================
function saveGraphSettings(id) {
    let graph = id + 'Graph';
    let settings = {
        dotNumber: document.getElementById(graph + '_dotNumber').value * 6,
    }

    //apply changes to graph settings
    if (id == 'sound') {
        for (key in settings) {
            graphSettings[0][key] = settings[key];
            window.localStorage.setItem('soundGraphDotNumber', settings[key]);
            loadData(id);
        }
    } else {
        for (key in settings) {
            graphSettings[1][key] = settings[key];
            window.localStorage.setItem('lightGraphDotNumber', settings[key]);
            loadData(id);
        }
    }
}


//================================Handle event listeners for chart extend================================
document.getElementById('expandSoundGraph').onclick = () => toggleExtendedClass('soundGraphWrapper');
document.getElementById('expandLightGraph').onclick = () => toggleExtendedClass('lightGraphWrapper');

//Extend chart block to view settings
function toggleExtendedClass(element) {
    document.getElementById(element).classList.toggle('graphEl-Expanded')
    if (element.includes('sound')) {
        soundGraphExpandedFlag = !soundGraphExpandedFlag;
    }

    if (element.includes('light')) {
        lightGraphExpandedFlag = !lightGraphExpandedFlag;
    }
}

//================================Handle chart fullscreen view================================

//Display chart in fullscreen
function graphEnableFullscreen() {
    //Clone chart without content
    var graphClone = this.cloneNode(false);
    graphClone.id = this.id + 'Clone';

    let element = document.getElementById(this.id);
    let cloneDimensions = { width: element.clientWidth, height: element.clientHeight };

    this.classList.add('graphFullscreen');
    element.onclick = graphDisableFullscreen;

    this.parentNode.insertBefore(graphClone, this);

    let clone = document.getElementById(graphClone.id);

    clone.width = cloneDimensions.width;
    clone.height = cloneDimensions.height;
    clone.style.width = clone.width + 'px';
    clone.style.height = clone.height + 'px';
    element.style.maxHeight = 'none';

    document.getElementById('shader').classList.toggle('shaderToggle');

    window[this.id].reflow();
}

//Close fullscreen view
function graphDisableFullscreen() {
    this.classList.remove('graphFullscreen');

    cloneElementID = this.id + 'Clone';
    let clone = document.getElementById(cloneElementID);
    let element = document.getElementById(this.id);

    element.style.maxHeight = clone.height + 'px';

    window[this.id].setSize(element.width, element.height, false);
    soundGraph.reflow();
    clone.remove();

    document.getElementById('shader').classList.toggle('shaderToggle');

    element.onclick = graphEnableFullscreen;
    window[this.id].reflow();

}


//================================Dynamically get chart data================================

function loadData(chart) {
    let num = (chart == 'sound') ? graphSettings[0].dotNumber : graphSettings[1].dotNumber;
    console.log(num);
    let url = '/loadData?chart='+chart+'&num='+num;
    fetch(url)  
    .then(response => response.json())
    .then(data => {
        if (data.data != 'no_data') {
            if(chart == 'sound'){
                DATA.sound.splice(0, DATA.sound.length);
            
                data.forEach( element => {
                    DATA.sound.push([element.time, parseFloat(element.sensor_data)])

                    soundGraph.series[0].setData(DATA.sound);
                })
            } else {
                DATA.light.splice(0, DATA.light.length);
            
                data.forEach( element => {
                    DATA.light.push([element.time, parseFloat(element.sensor_data)])

                    lightGraph.series[0].setData(DATA.light);
                })
            }
        }
        else alert('No saved data!');
    });
};

var socket = io("192.168.0.13:5000");
socket.on('JS_get_data', function(data) {
    soundData = data[0];
    DATA.sound.push([soundData.time, soundData.data]);
    //Crop data to fit number of dots set by settings
    DATA.sound.splice(0, DATA.sound.length - graphSettings[0].dotNumber*6);
    soundGraph.series[0].setData(DATA.sound);
    

    lightData = data[1];
    DATA.light.push([lightData.time, lightData.data]);
    //Crop data to fit number of dots set by settings
    DATA.light.splice(0, DATA.light.length - graphSettings[1].dotNumber*6);
    lightGraph.series[0].setData(DATA.light);
});


function lightChange() {
    let lightIntensityValue = ("00" + (lightIntensitySlider.value).toString()).slice(-3);
    socket.emit('lightChange', {'data':lightIntensityValue});
}

function toggleLight() {
    if (lightToggle) {
        lightIntensitySlider.disabled = true;
    }
    else {
        lightIntensitySlider.disabled = false;
    }
    lightToggle = !lightToggle;

    for (key in lightImgs) {
        lightImgs[key].classList.toggle('lightOn');
    }
    
}
