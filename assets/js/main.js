/* ウチなら不動産 — 空き家買取LP */
(function () {
  'use strict';

  /* ---- モバイルナビ開閉 ---- */
  var body = document.body;
  var burger = document.getElementById('hamburger');
  var backdrop = document.getElementById('navBackdrop');

  function setNav(open) {
    body.classList.toggle('nav-open', open);
    if (burger) burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (burger) burger.addEventListener('click', function () {
    setNav(!body.classList.contains('nav-open'));
  });
  if (backdrop) backdrop.addEventListener('click', function () { setNav(false); });
  // ナビ内リンクをタップしたら閉じる
  document.querySelectorAll('#gnav a').forEach(function (a) {
    a.addEventListener('click', function () { setNav(false); });
  });

  /* ---- チップ（物件種別）の選択ハイライト（:has 非対応/未invalidateブラウザ対策） ---- */
  document.querySelectorAll('.chips').forEach(function (group) {
    group.querySelectorAll('input[type="radio"]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        group.querySelectorAll('label').forEach(function (l) { l.classList.remove('is-checked'); });
        if (inp.checked) inp.closest('label').classList.add('is-checked');
      });
    });
  });

  /* ---- スクロールでヘッダーに影 ---- */
  var header = document.querySelector('.l-header');
  window.addEventListener('scroll', function () {
    if (header) header.style.boxShadow = window.scrollY > 20 ? '0 4px 18px rgba(21,42,92,.08)' : 'none';
  }, { passive: true });

  /* ---- スクロールインのフェードアップ ---- */
  var targets = document.querySelectorAll(
    '.hero-panel,.hero__badges li,.stat,.reason-card,.flow-step,.voice-card,.news__list,.company__table,.philosophy__body p'
  );
  targets.forEach(function (el, i) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'none';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
  }

  /* ---- 査定フォーム送信 ----
     GAS Web App のエンドポイントを設定すると実送信になる。
     未設定（PASTE_...）の間は完了画面のみ表示するデモ挙動。 */
  var GAS_ENDPOINT = 'PASTE_YOUR_GAS_WEBAPP_URL_HERE';
  var form = document.getElementById('form');

  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      // ハニーポット（bot対策）
      if (form._honey && form._honey.value) return;

      // 簡易バリデーション
      var name = form.name.value.trim();
      var email = form.email.value.trim();
      if (!name || !email) {
        alert('お名前とメールアドレスをご入力ください。');
        return;
      }

      var btn = form.querySelector('.contact-form__submit');
      btn.disabled = true;
      btn.textContent = '送信中…';

      function showDone() {
        var done = document.createElement('div');
        done.className = 'form-done';
        done.innerHTML =
          '<h3>送信が完了しました</h3>' +
          '<p>お問い合わせありがとうございます。<br>担当者より最短即日でご連絡いたします。</p>';
        form.replaceWith(done);
      }

      if (GAS_ENDPOINT.indexOf('PASTE_') === 0) {
        // 未接続：デモ挙動
        setTimeout(showDone, 600);
        return;
      }

      // form-urlencoded で送信（CORSプリフライト回避）
      var data = new URLSearchParams(new FormData(form));
      fetch(GAS_ENDPOINT, { method: 'POST', body: data })
        .then(function (res) { return res.json().catch(function () { return { ok: res.ok }; }); })
        .then(function () { showDone(); })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'この内容で無料査定を依頼する';
          alert('送信に失敗しました。お手数ですがお電話にてご連絡ください。');
        });
    });
  }
})();
