(function () {
  var navToggle = document.getElementById("navbar-toggler");
  var nav = document.getElementById("navbar-nav");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!expanded));
      navToggle.classList.toggle("collapsed", expanded);
      nav.classList.toggle("show", !expanded);
    });
  }
})();

(function () {
  var modal = document.getElementById("search-modal");
  var toggle = document.getElementById("search-toggle");
  var close = document.getElementById("search-close");
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var index = null;

  if (!modal || !toggle || !close || !input || !results) return;

  function openSearch() {
    modal.hidden = false;
    document.body.classList.add("search-open");
    if (!index) {
      fetch("/search.json")
        .then(function (response) { return response.json(); })
        .then(function (data) {
          index = data;
          renderResults("");
        })
        .catch(function () {
          results.innerHTML = '<p class="search-empty">Search index could not be loaded.</p>';
        });
    } else {
      renderResults(input.value);
    }
    setTimeout(function () { input.focus(); }, 0);
  }

  function closeSearch() {
    modal.hidden = true;
    document.body.classList.remove("search-open");
  }

  function renderResults(query) {
    var q = query.trim().toLowerCase();
    var matches = (index || []).filter(function (item) {
      if (!q) return false;
      return (item.title + " " + item.content).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 12);

    if (!q) {
      results.innerHTML = '<p class="search-empty">Start typing to search the site.</p>';
      return;
    }

    if (!matches.length) {
      results.innerHTML = '<p class="search-empty">No results found.</p>';
      return;
    }

    results.innerHTML = matches.map(function (item) {
      return '<a class="search-result" href="' + item.url + '"><span>' + escapeHtml(item.title) + '</span><small>' + item.url + '</small></a>';
    }).join("");
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  toggle.addEventListener("click", openSearch);
  close.addEventListener("click", closeSearch);
  input.addEventListener("input", function () { renderResults(input.value); });
  modal.addEventListener("click", function (event) {
    if (event.target === modal) closeSearch();
  });

  document.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape" && !modal.hidden) closeSearch();
  });
})();
