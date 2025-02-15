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
        "datum": "6/6/2022",
        "soort": "BF"
    },
    {
        "datum": "15/8/2022",
        "soort": "BF"
    },
    {
        "datum": "1/1/2021",
        "soort": "BF"
    },
    {
        "datum": "11/11/2021",
        "soort": "BF"
    },
    {
        "datum": "7/1/2025",
        "soort": "ADV"
    },
    {
        "datum": "14/1/2025",
        "soort": "ADV"
    },
    {
        "datum": "15/1/2025",
        "soort": "OPL"
    },
    {
        "datum": "24/1/2025",
        "soort": "ADV"
    },
    {
        "datum": "3/1/2025",
        "soort": "ADV"
    },
    {
        "datum": "31/1/2025",
        "soort": "OPL"
    },
    {
        "datum": "11/2/2025",
        "soort": "OPL"
    },
    {
        "datum": "28/2/2025",
        "soort": "x"
    },
    {
        "datum": "29/3/2025",
        "soort": "ADV"
    },
    {
        "datum": "30/3/2025",
        "soort": "BV"
    },
    {
        "datum": "26/3/2025",
        "soort": "ADV"
    },
    {
        "datum": "24/3/2025",
        "soort": "BV"
    },
    {
        "datum": "25/3/2025",
        "soort": "BV"
    },
    {
        "datum": "18/3/2025",
        "soort": "ADV"
    },
    {
        "datum": "27/5/2025",
        "soort": "BF"
    },
    {
        "datum": "9/5/2025",
        "soort": "BV"
    },
    {
        "datum": "1/7/2025",
        "soort": "BV"
    },
    {
        "datum": "13/6/2025",
        "soort": "BF"
    },
    {
        "datum": "18/7/2025",
        "soort": "BV"
    },
    {
        "datum": "5/8/2025",
        "soort": "BV"
    },
    {
        "datum": "11/8/2025",
        "soort": "BV"
    },
    {
        "datum": "12/8/2025",
        "soort": "BV"
    },
    {
        "datum": "13/8/2025",
        "soort": "BV"
    },
    {
        "datum": "16/8/2025",
        "soort": "ADV"
    },
    {
        "datum": "17/8/2025",
        "soort": "ADV"
    },
    {
        "datum": "22/8/2025",
        "soort": "ADV"
    },
    {
        "datum": "21/8/2025",
        "soort": "ADV"
    },
    {
        "datum": "23/8/2025",
        "soort": "BF"
    },
    {
        "datum": "24/8/2025",
        "soort": "ADV"
    },
    {
        "datum": "26/9/2025",
        "soort": "ADV"
    },
    {
        "datum": "09/9/2025",
        "soort": "BV"
    },
    {
        "datum": "14/10/2025",
        "soort": "BV"
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
        "datum": "4/12/2025",
        "soort": "BF"
    },
    {
        "datum": "5/12/2025",
        "soort": "BF"
    },
    {
        "datum": "23/12/2025",
        "soort": "BV"
    },
    {
        "datum": "30/12/2025",
        "soort": "ADV"
    },
    {
        "datum": "31/12/2025",
        "soort": "ADV"
    },
    {
        "datum": "3/1/2025",
        "soort": "ADV"
    },
    {
        "datum": "21/1/2025",
        "soort": "L"
    },
    {
        "datum": "1/5/2029",
        "soort": "BF"
    },
    {
        "datum": "1/1/2030",
        "soort": "BF"
    },
    {
        "datum": "21/7/2026",
        "soort": "BF"
    },
    {
        "datum": "24/2/2025",
        "soort": "L"
    },
    {
        "datum": "30/1/2025",
        "soort": "x"
    },
    {
        "datum": "29/12/2025",
        "soort": "BF"
    },
    {
        "datum": "22/4/2025",
        "soort": "BV"
    },
    {
        "datum": "3/4/2025",
        "soort": "D"
    }
  ];