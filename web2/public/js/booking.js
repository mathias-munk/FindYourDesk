function makeBooking(id) {
  $("#result").load("/room");
}


const openConfirmButtons = document.querySelectorAll('[data-modal-target]')
const closeConfirmButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openConfirmButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openPopup(modal)
  })
})

closeConfirmButtons.forEach(button => {
  button.addEventListener('click', () => {
    const confirm = button.closest('.modal')
    closePopup(confirm)
  })
})

function openPopup(modal) {
  if (modal == null) return
  modal.classList.add('active');
  overlay.classList.add('active')
}

function closePopup(modal) {
  if (modal == null) return
  modal.classList.remove('active');
  overlay.classList.remove('active')
}