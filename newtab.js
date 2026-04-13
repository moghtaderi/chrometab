document.addEventListener("DOMContentLoaded", () => {
  // Individual card clicks open in the current tab (default <a> behaviour).
  // No extra JS needed for that.

  // "Launch All" buttons: open every card in the group as a new tab.
  document.getElementById("launch-all-primary").addEventListener("click", () => {
    launchGroup("primary");
  });

  document.getElementById("launch-all-secondary").addEventListener("click", () => {
    launchGroup("secondary");
  });

  function launchGroup(group) {
    const cards = document.querySelectorAll(`.card[data-group="${group}"]`);
    cards.forEach((card) => {
      window.open(card.href, "_blank");
    });
  }
});
