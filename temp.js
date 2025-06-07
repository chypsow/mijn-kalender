export function adjustLayout() {
  const schermGrootte = 1900;
    if (window.innerWidth < schermGrootte) {
      document.body.style.fontSize = '10px'; // Pas de fontgrootte aan naar wens
      document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.display = 'none'; // Verberg elementen met inline style
      });
      document.querySelectorAll('.cell').forEach(element => {
        element.style.padding = 0; 
       
      });
        console.log(`schermgrootte is minder dan ${schermGrootte}px geweest : ${window.innerWidth}px`);
    } else {
      document.body.style.fontSize = ''; // Reset de fontgrootte
      document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.display = ''; // Zet display terug naar 'flex'
      });
      document.querySelectorAll('.cell').forEach(element => {
        element.style.padding = ''; 
        
      });
      console.log(`schermgrootte: ${window.innerWidth}px`);
    }
};
export function adjustLayout2() {
    const schermGrootte = 1900;
    if (window.innerWidth < schermGrootte) {
    document.body.style.fontSize = '10px'; // Pas de fontgrootte aan naar wens
    document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.visibility = 'hidden'; // Verberg elementen met inline style
    });
    //DOM.topNav.classList.add('close');
    //document.querySelector('.hoofd-container').style.width = '100%';
    document.getElementById('bars').classList.remove('hidden');
        //console.log(`schermgrootte is minder dan ${schermGrootte}px geweest : ${window.innerWidth}px`);
    } else {
    document.body.style.fontSize = ''; // Reset de fontgrootte
    document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.visibility = ''; // Zet display terug naar 'flex'
    });
    DOM.topNav.classList.remove('close');
    //document.querySelector('.hoofd-container').style.width = '87%';
    //console.log(`schermgrootte: ${window.innerWidth}px`);
    document.getElementById('bars').classList.add('hidden');
    }
};