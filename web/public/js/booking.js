const chairDOM = document.querySelectorAll(".chair");
// const openConfirmButtons = document.querySelectorAll('[data-modal-target]');
// const closeConfirmButtons = document.querySelectorAll('[data-close-button]');
const overlay = document.getElementById("overlay");

document.addEventListener("DOMContentLoaded", () => {
  chairDOM.forEach(chair => {
    if (!chair.classList.contains("free")) {
      chair.classList.remove("book_hover");
    }
    chair.addEventListener("click", () => {
      let result = confirm(
        "Do you want to make a booking on this chair?\nYou will have 10 minutes until the booking expires.\nYour chair ID is: " +
          chair.dataset.id
      );
      if (result == true) {
        alert("Booking confirmed. Chair ID: " + chair.dataset.id);
      }
    });
  });
});

//
// openConfirmButtons.forEach(button => {
//   button.addEventListener('click', () => {
//     const modal = document.querySelector(button.dataset.modalTarget)
//     openPopup(modal)
//   })
// })
//
// closeConfirmButtons.forEach(button => {
//   button.addEventListener('click', () => {
//     const confirm = button.closest('.modal')
//     closePopup(confirm)
//   })
// })
//
// function openPopup(modal) {
//   if (modal == null) return
//   modal.classList.add('active');
//   overlay.classList.add('active')
// }
//
// function closePopup(modal) {
//   if (modal == null) return
//   modal.classList.remove('active');
//   overlay.classList.remove('active')
// }
