
async function subscribe(evt){
  evt.preventDefault();
  const email = document.getElementById('email').value.trim();
  if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){ alert('Email invalide'); return; }
  alert('Merci, vous êtes inscrit(e) ✔'); // placeholder
}
