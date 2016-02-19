window.onload = function() {
  document.getElementById('cookieForm').addEventListener('submit', addFeatureFlag);
  document.getElementById('resetBtn').addEventListener('click', resetFeatureFlag);
  document.getElementById('updateBtn').addEventListener('click', updateFeatureFlags);
};

function addFeatureFlag(e) {
  e.preventDefault();

  var featureName = document.querySelector('#feature-name').value,
      now = new Date(),
      exHours = 1,
      expires = new Date(now.getTime() + (exHours*60*60*1000)).toUTCString();
  
  sendCookie(featureName, expires);
}

function resetFeatureFlag(e) {
  e.preventDefault();

  var now = new Date(),
      expires = new Date(now.getTime() + 10000).toUTCString();
  
  sendCookie('reset', expires);
}

function updateFeatureFlags() {
  var table = document.getElementById("featuresTable");
  
  chrome.cookies.getAll({"url":tab[0].url,"name": 'features'},function (cookie){
    console.log('asdasd');
    console.log(cookie);
  });

  var row = table.insertRow();
  
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  
  cell1.innerHTML = "NEW CELL1";
  cell2.innerHTML = "NEW CELL2";
}

function sendCookie(featureName, expires) {
  chrome.tabs.executeScript({
    code: 'document.cookie="features=' + featureName + '; expires=' + expires + '; path=/";'
  }, function() {
    chrome.tabs.reload();
  });
}
