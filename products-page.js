(function () {
  "use strict";

  // 관리자에서 입력한 기존 분류·라벨·상품명으로 세 제품 페이지를 구분합니다.
  // products.json의 필드나 저장 구조는 변경하지 않습니다.
  const group = document.body.dataset.productGroup || "purchase";
  const groupNames = {
    purchase: "구매의상",
    accessories: "장신구",
    rental: "대여의상"
  };

  function searchableText(product) {
    return [
      product.category,
      product.label,
      product.name,
      ...(Array.isArray(product.keywords) ? product.keywords : [])
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function productGroup(product) {
    const text = searchableText(product);

    // 대여 표기를 가장 먼저 확인해 구매 의상과 겹치지 않게 합니다.
    if (/대여|렌탈|rental|rent/.test(text)) return "rental";
    if (/장신구|액세서리|accessor|주얼리|jewel|귀걸이|목걸이|반지|팔찌|브로치|노리개|비녀|가방|신발|스카프|벨트|모자/.test(text)) {
      return "accessories";
    }

    // 별도 표기가 없는 기존 의류는 구매의상으로 보여줍니다.
    return "purchase";
  }

  function productCard(product) {
    const image = ProductCatalog.safeImageUrl(product.images && product.images[0]);
    const imageHtml = image
      ? '<img src="' + ProductCatalog.escapeHtml(image) + '" alt="' + ProductCatalog.escapeHtml(product.name) + '" onerror="this.remove()" />'
      : "";
    const priceHtml = product.price
      ? '<p class="price">' + ProductCatalog.escapeHtml(product.price) + "</p>"
      : "";

    return (
      '<a class="card" href="product.html?id=' + encodeURIComponent(product.id) + '">' +
      '<div class="card-img">' + imageHtml + "</div>" +
      '<p class="k">' + ProductCatalog.escapeHtml(product.label || product.category || "") + "</p>" +
      "<h3>" + ProductCatalog.escapeHtml(product.name) + "</h3>" +
      "<p>" + ProductCatalog.escapeHtml(product.summary || "") + "</p>" +
      priceHtml +
      "</a>"
    );
  }

  function enableCardTilt(container) {
    const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canTilt || reduceMotion) return;

    container.querySelectorAll(".card").forEach((card) => {
      let frame = 0;
      let pointerX = 0;
      let pointerY = 0;

      function renderTilt() {
        const rect = card.getBoundingClientRect();
        const x = Math.min(Math.max((pointerX - rect.left) / rect.width, 0), 1);
        const y = Math.min(Math.max((pointerY - rect.top) / rect.height, 0), 1);

        card.style.setProperty("--tilt-x", ((0.5 - y) * 9).toFixed(2) + "deg");
        card.style.setProperty("--tilt-y", ((x - 0.5) * 9).toFixed(2) + "deg");
        card.style.setProperty("--card-shadow-x", ((0.5 - x) * 20).toFixed(1) + "px");
        card.style.setProperty("--card-shadow-y", (10 + (0.5 - y) * 12).toFixed(1) + "px");
        card.style.setProperty("--card-light-x", (x * 100).toFixed(1) + "%");
        card.style.setProperty("--card-light-y", (y * 100).toFixed(1) + "%");
        frame = 0;
      }

      card.addEventListener("pointermove", (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!frame) frame = window.requestAnimationFrame(renderTilt);
      });

      card.addEventListener("pointerleave", () => {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.style.setProperty("--card-shadow-x", "0px");
        card.style.setProperty("--card-shadow-y", "12px");
        card.style.setProperty("--card-light-x", "50%");
        card.style.setProperty("--card-light-y", "18%");
      });
    });
  }

  ProductCatalog.loadVisibleProducts()
    .then((products) => {
      const box = document.getElementById("product-list");
      const filteredProducts = products.filter((product) => productGroup(product) === group);

      if (!filteredProducts.length) {
        box.innerHTML = '<p class="product-empty">등록된 ' + groupNames[group] + " 제품이 없습니다.</p>";
        return;
      }

      box.innerHTML = filteredProducts.map(productCard).join("");
      enableCardTilt(box);
    })
    .catch(() => {
      document.getElementById("product-list").innerHTML =
        '<p class="product-empty">제품을 불러오지 못했습니다. 로컬 서버에서 다시 확인해 주세요.</p>';
    });
})();
