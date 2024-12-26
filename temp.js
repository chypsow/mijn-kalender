function adjustLayout() {
    if (window.innerWidth < 1400px) {
      document.body.style.fontSize = '14px'; // Pas de fontgrootte aan naar wens
      document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.display = 'none'; // Verberg elementen met inline style
      });
        console.log('schermgroote is minder dan 1400px geweest');
    } else {
      document.body.style.fontSize = ''; // Reset de fontgrootte
      document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.display = 'flex'; // Zet display terug naar 'flex'
      });
    }
  }

  window.addEventListener('resize', adjustLayout);
  window.addEventListener('load', adjustLayout);