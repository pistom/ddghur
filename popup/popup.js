var ddghurBlockedDomains = browser.storage.local.get("ddghurBlockedDomains");
var ddghurOptions = browser.storage.local.get("ddghurOptions");
init();

function init(){
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
});

var showHiddenLink = document.querySelector(".showHiddenLink");
var showHiddenLinkIcon = showHiddenLink.querySelector("img.icon");

ddghurOptions.then(function(res){
    var options = (res.ddghurOptions !== undefined) ? res.ddghurOptions : {}; 
    if(("showedHiddenResults" in options) && options.showedHiddenResults === true) {
        showHiddenLinkIcon.src = "images/showed.svg";
        showHiddenLink.classList.add("enabled");
    }
});

showHiddenLink.addEventListener("click", (e) => {
    
    var code = "";
    if(showHiddenLink.classList.contains("enabled")){
        showHiddenLinkIcon.src = "images/hidden.svg";
        code = 'var hiddenResults = document.querySelectorAll(".hideResult");'+
               'for(let i=0; i<hiddenResults.length; i++){hiddenResults[i].classList.remove("enabled")}';
        browser.storage.local.set({ ddghurOptions : {showedHiddenResults:false} });
    }
    else {
        showHiddenLinkIcon.src = "images/showed.svg";
        code = 'var hiddenResults = document.querySelectorAll(".hideResult");'+
               'for(let i=0; i<hiddenResults.length; i++){hiddenResults[i].classList.add("enabled")}';
        browser.storage.local.set({ ddghurOptions : {showedHiddenResults:true} });
    }
    showHiddenLink.classList.toggle("enabled");
    browser.tabs.executeScript({
        code: code
    });
});

