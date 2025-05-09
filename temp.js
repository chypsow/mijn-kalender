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