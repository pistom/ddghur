var ddghurBlockedDomains = browser.storage.local.get("ddghurBlockedDomains");
var ddghurOptions = browser.storage.local.get("ddghurOptions");

showStoredObjects = function(){
    browser.storage.local.get("ddghurOptions").then(function(data){
        console.dir(data.ddghurOptions);
    });
    browser.storage.local.get("ddghurBlockedDomains").then(function(data){
        console.log(data.ddghurBlockedDomains.join(', '));
    });
}

init();

function init(){
    showStoredObjects();
    ddghurBlockedDomains.then(function(res){
        ddghurBlockedDomainsArr = (res.ddghurBlockedDomains !== undefined) ? res.ddghurBlockedDomains : [];  
        displayDomains(ddghurBlockedDomainsArr);
    });
}

function reloadPage(){
    var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
    gettingActiveTab.then((tabs) => {
        browser.tabs.reload();
    });
}

function storeDomain(domain) {
    if(domain !== ""){
        if(ddghurBlockedDomainsArr.indexOf(domain) === -1){
            ddghurBlockedDomainsArr.push(domain);
            browser.storage.local.set({ ddghurBlockedDomains : ddghurBlockedDomainsArr });
            displayDomains(ddghurBlockedDomainsArr);
            reloadPage();
        } else {
            alert("This domain has been alredy added.");
        }
    }
}

function deleteDomain() {
    let domain = this.parentNode.querySelector(".domainsList__rowDomain").innerText;
    let index = ddghurBlockedDomainsArr.indexOf(domain);
    ddghurBlockedDomainsArr.splice(index,1);
    browser.storage.local.set({ ddghurBlockedDomains : ddghurBlockedDomainsArr });
    displayDomains(ddghurBlockedDomainsArr);
    reloadPage();
}

function displayDomains(blockedDomains) {
    let domainsWrapper = document.querySelector(".domainsList");
    domainsWrapper.innerHTML = "";
    let df = document.createDocumentFragment();
    if(blockedDomains.length === 0) {
        let noDomains = document.createElement("span");
        let noDomainsTxt = document.createTextNode("No hidden domains");
        noDomains.appendChild(noDomainsTxt);
        df.appendChild(noDomains);
    }
    for(let i=0; i<blockedDomains.length; i++){
        let row = document.createElement("div");
            row.classList.add("domainsList__row");
        let domain = document.createElement("div");
            domain.classList.add("domainsList__rowDomain");
        let domainTxt = document.createTextNode(blockedDomains[i]);
        let delBtn = document.createElement("button");
            delBtn.classList.add("domainsList__rowDelBtn");
        let delBtnIcon = document.createElement("img");
            delBtnIcon.src = "images/remove.svg";
            delBtnIcon.classList.add("icon");
        domain.appendChild(domainTxt);
        delBtn.appendChild(delBtnIcon);
        row.appendChild(domain);
        row.appendChild(delBtn);
        df.appendChild(row);

        delBtn.addEventListener("click",deleteDomain,false);
    }
    domainsWrapper.appendChild(df);
}

var ddghurForm = document.querySelector("form");
ddghurForm.addEventListener("submit", function(e){
    e.preventDefault();
    storeDomain(ddghurForm.domain.value);
    ddghurForm.querySelector("[name='domain']").value = "";
});

var showHiddenLink = document.querySelector(".showHiddenLink");
var showHiddenLinkIcon = showHiddenLink.querySelector("img.icon");

var animationsLink = document.querySelector(".animationsLink");
var animationsLinkIcon = animationsLink.querySelector("img.icon");

var exportListLink = document.querySelector(".exportListLink");

var options = {};
ddghurOptions.then(function(res){
    options = (res.ddghurOptions !== undefined) ? res.ddghurOptions : {}; 
    if(("showedHiddenResults" in options) && options.showedHiddenResults === true) {
        showHiddenLinkIcon.src = "images/showed.svg";
        showHiddenLink.classList.add("enabled");
    }
    if(!("animations" in options) || options.animations === true) {
        animationsLinkIcon.src = "images/enabled.svg";
        animationsLink.classList.add("enabled");
    }
});


showHiddenLink.addEventListener("click", (e) => {
    
    var code = "";
    if(showHiddenLink.classList.contains("enabled")){
        showHiddenLinkIcon.src = "images/hidden.svg";
        code = 'var hiddenResults = document.querySelectorAll(".hideResult");'+
               'for(let i=0; i<hiddenResults.length; i++){hiddenResults[i].classList.remove("enabled")}';
        options.showedHiddenResults = false;
        browser.storage.local.set({ "ddghurOptions" : options });
    }
    else {
        showHiddenLinkIcon.src = "images/showed.svg";
        code = 'var hiddenResults = document.querySelectorAll(".hideResult");'+
               'for(let i=0; i<hiddenResults.length; i++){hiddenResults[i].classList.add("enabled")}';
        options.showedHiddenResults = true;
        browser.storage.local.set({ "ddghurOptions" : options });
    }
    showHiddenLink.classList.toggle("enabled");
    browser.tabs.executeScript({
        code: code
    });
});

animationsLink.addEventListener("click", (e) => {
    
    if(animationsLink.classList.contains("enabled")){
        animationsLinkIcon.src = "images/disabled.svg";
        options.animations = false;
        browser.storage.local.set({ "ddghurOptions" : options });
    }
    else {
        animationsLinkIcon.src = "images/enabled.svg";
        options.animations = true;
        browser.storage.local.set({ "ddghurOptions" : options });
    }
    animationsLink.classList.toggle("enabled");
    
});

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    var a = document.createElement("a"),
            url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);  
    }, 0);
}

function convertArrayToHohserFormat(arr) {
    var hohserFormatObject = [];
    arr.forEach(element => {
        hohserFormatObject.push({
            domainName: element
        })
    });
    return JSON.stringify(hohserFormatObject);
}

exportListLink.addEventListener("click", (e) => {
    download(convertArrayToHohserFormat(ddghurBlockedDomainsArr), 'ddghr-domains.json', 'application/json');
});

