const chairDOM = document.querySelectorAll(".chair");
const overlay = document.getElementById("overlay");

document.addEventListener("DOMContentLoaded", () => {
  chairDOM.forEach(chair => {
    if (!chair.classList.contains("free")) {
      chair.classList.remove("book_hover");
    } else {
      chair.addEventListener("click", () => {
        let result = confirm(
          "Do you want to make a booking on this chair?\n\nYou will have 10 minutes until the booking expires.\n\nYour chair ID is: " +
            chair.dataset.id
        );
        if (result == true) {
          alert("Booking confirmed.\n\nChair ID: " + chair.dataset.id);
          document.location.href = `/book/${chair.dataset.room}/${chair.dataset.id}`;
        }
      });
    }
  });
});
