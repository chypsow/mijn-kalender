export function adjustLayout() {
  const schermGrootte = 1900;
    if (window.innerWidth < schermGrootte) {
      /*document.body.style.fontSize = '10px'; // Pas de fontgrootte aan naar wens
      document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.display = 'none'; // Verberg elementen met inline style
      });
      document.querySelectorAll('.cell').forEach(element => {
        element.style.padding = 0; 
       
      });*/
        console.log(`schermgrootte is minder dan ${schermGrootte}px geweest : ${window.innerWidth}px`);
    } else {
      /*document.body.style.fontSize = ''; // Reset de fontgrootte
      document.querySelectorAll('.hidden-on-small').forEach(element => {
        element.style.display = ''; // Zet display terug naar 'flex'
      });
      document.querySelectorAll('.cell').forEach(element => {
        element.style.padding = ''; 
        
      });*/
      console.log(`schermgrootte: ${window.innerWidth}px`);
    }
  }

  
  export const data = [
      {
        "datum": "06/06/2022",
        "soort": "BF"
      },
      {
        "datum": "15/08/2022",
        "soort": "BF"
      },
      {
        "datum": "01/01/2021",
        "soort": "BF"
      },
      {
        "datum": "11/11/2021",
        "soort": "BF"
      },
      {
        "datum": "07/01/2025",
        "soort": "ADV"
      },
      {
        "datum": "14/01/2025",
        "soort": "ADV"
      },
      {
        "datum": "15/01/2025",
        "soort": "OPL"
      },
      {
        "datum": "24/01/2025",
        "soort": "ADV"
      },
      {
        "datum": "30/01/2025",
        "soort": "x"
      },
      {
        "datum": "31/01/2025",
        "soort": "OPL"
      },
      {
        "datum": "11/02/2025",
        "soort": "OPL"
      },
      {
        "datum": "28/02/2025",
        "soort": "BV"
      },
      {
        "datum": "29/03/2025",
        "soort": "ADV"
      },
      {
        "datum": "30/03/2025",
        "soort": "ADV"
      },
      {
        "datum": "26/03/2025",
        "soort": "ADV"
      },
      {
        "datum": "24/03/2025",
        "soort": "BV"
      },
      {
        "datum": "25/03/2025",
        "soort": "BV"
      },
      {
        "datum": "18/03/2025",
        "soort": "BV"
      },
      {
        "datum": "04/04/2025",
        "soort": "BV"
      },
      {
        "datum": "27/05/2025",
        "soort": "BF"
      },
      {
        "datum": "09/05/2025",
        "soort": "BV"
      },
      {
        "datum": "01/07/2025",
        "soort": "BV"
      },
      {
        "datum": "13/06/2025",
        "soort": "BF"
      },
      {
        "datum": "18/07/2025",
        "soort": "ADV"
      },
      {
        "datum": "05/08/2025",
        "soort": "BV"
      },
      {
        "datum": "11/08/2025",
        "soort": "BV"
      },
      {
        "datum": "12/08/2025",
        "soort": "BV"
      },
      {
        "datum": "13/08/2025",
        "soort": "BV"
      },
      {
        "datum": "16/08/2025",
        "soort": "ADV"
      },
      {
        "datum": "17/08/2025",
        "soort": "ADV"
      },
      {
        "datum": "22/08/2025",
        "soort": "BF"
      },
      {
        "datum": "21/08/2025",
        "soort": "ADV"
      },
      {
        "datum": "23/08/2025",
        "soort": "ADV"
      },
      {
        "datum": "24/08/2025",
        "soort": "ADV"
      },
      {
        "datum": "26/09/2025",
        "soort": "ADV"
      },
      {
        "datum": "09/09/2025",
        "soort": "BV"
      },
      {
        "datum": "14/10/2025",
        "soort": "BV"
      },
      {
        "datum": "30/10/2025",
        "soort": "ADV"
      },
      {
        "datum": "31/10/2025",
        "soort": "ADV"
      },
      {
        "datum": "18/11/2025",
        "soort": "BV"
      },
      {
        "datum": "04/12/2025",
        "soort": "BF"
      },
      {
        "datum": "05/12/2025",
        "soort": "BF"
      },
      {
        "datum": "23/12/2025",
        "soort": "BV"
      },
      {
        "datum": "30/12/2025",
        "soort": "BF"
      },
      {
        "datum": "31/12/2025",
        "soort": "ADV"
      },
      {
        "datum": "03/01/2025",
        "soort": "ADV"
      },
      {
        "datum": "21/01/2025",
        "soort": "L"
      },
      {
        "datum": "01/05/2029",
        "soort": "BF"
      },
      {
        "datum": "01/01/2030",
        "soort": "BF"
      },
      {
        "datum": "22/04/2025",
        "soort": "OPL"
      },
      {
        "datum": "21/07/2026",
        "soort": "BF"
      },
      {
        "datum": "17/02/2025",
        "soort": "BV"
      }
    ]