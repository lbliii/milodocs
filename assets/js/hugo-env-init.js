(function(){
  try {
    var script = document.getElementById('hugo-environment-json');
    if (!script) return;
    var data = JSON.parse(script.textContent || '{}');
    window.HugoEnvironment = data;
  } catch (e) {}
})();


