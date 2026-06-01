const visitorNameElement = document.getElementById("visitor-name");

const hashValue = decodeURIComponent(location.hash.slice(1) || "Visitante");

visitorNameElement.textContent = hashValue;
