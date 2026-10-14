/* Membership 2026 — form 6926340 */
(function () {
  function fire(el, type) {
    var e = document.createEvent('HTMLEvents');
    e.initEvent(type, true, true);
    el.dispatchEvent(e);
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text) node.textContent = text;
    return node;
  }

  function init() {
    var form = document.querySelector('form[name="form_6926340"]');
    if (!form) return false;                       /* form not on page yet */
    if (form.getAttribute('data-membership-init')) return true;
    form.setAttribute('data-membership-init', '1');
    if (window.console) console.log('[membership 6926340] script running');

    /* 1. Card: wrap from the header_97 line through the submit line
          (falls back to the "1. Partnership Opportunities" header if header_97 isn't on the page) */
    var startHeader = form.querySelector('#header_97');
    var liStart = startHeader ? startHeader.closest('li') : form.querySelector('#cid_75');
    var submitBtn = form.querySelector('.form-submit-button');
    var liEnd = submitBtn ? submitBtn.closest('li') : null;

    if (liStart && liEnd && !form.querySelector('.custom-form-wrap')) {
      var wrapper = document.createElement('div');
      wrapper.className = 'custom-form-wrap';
      liStart.parentNode.insertBefore(wrapper, liStart);
      var current = liStart;
      while (current) {
        var next = current.nextElementSibling;
        wrapper.appendChild(current);
        if (current === liEnd) break;
        current = next;
      }
    }

    /* 1b. Pricing group: info (98 + 75, in page order) on the left,
           toggle (93) + Monthly (95) + Annually (96) stacked on the right */
    var cid75 = form.querySelector('#cid_75');
    var infoLis = [form.querySelector('li#id_98'), cid75 ? cid75.closest('li') : null]
      .filter(Boolean)
      .sort(function (a, b) {
        return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
      });
    var pricingLis = ['li#id_93', 'li#id_95', 'li#id_96'].map(function (sel) {
      return form.querySelector(sel);
    }).filter(Boolean);

    if (infoLis.length && pricingLis.length && !form.querySelector('.pricing-split')) {
      var pricingSplit = el('div', 'pricing-split');
      var pricingInfo = el('div', 'pricing-info');
      var pricingOptions = el('div', 'pricing-options');
      infoLis[0].parentNode.insertBefore(pricingSplit, infoLis[0]);
      for (var i = 0; i < infoLis.length; i++) pricingInfo.appendChild(infoLis[i]);
      for (var p = 0; p < pricingLis.length; p++) pricingOptions.appendChild(pricingLis[p]);
      pricingSplit.appendChild(pricingInfo);
      pricingSplit.appendChild(pricingOptions);
    }

    /* 2. Billing frequency (93): "Monthly [switch] Annually"
          - adds a switch between the two options; clicking it flips to the other option
          - defaults to Monthly so a set of cards always shows */
    var monthlyRadio = form.querySelector('#input_93_0');
    var annualRadio = form.querySelector('#input_93_1');
    if (monthlyRadio && annualRadio && !form.querySelector('.freq-switch')) {
      var sw = el('span', 'freq-switch');
      sw.setAttribute('role', 'switch');
      sw.setAttribute('tabindex', '0');
      sw.setAttribute('aria-label', 'Bill annually');
      monthlyRadio.closest('.form-radio-item').parentNode.insertBefore(sw, annualRadio.closest('.form-radio-item'));

      var syncSwitch = function () {
        sw.setAttribute('aria-checked', annualRadio.checked ? 'true' : 'false');
      };
      var flip = function () {
        (annualRadio.checked ? monthlyRadio : annualRadio).click();
      };
      sw.addEventListener('click', flip);
      sw.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
      });
      monthlyRadio.addEventListener('change', syncSwitch);
      annualRadio.addEventListener('change', syncSwitch);

      if (!monthlyRadio.checked && !annualRadio.checked) monthlyRadio.click();
      syncSwitch();
    }

    /* 3. Tier cards (95 / 96): split each option into name / price / note.
          "Partner $540/mo ($540 x 12 = $6,480 billed yearly)" →
          PARTNER / $540/mo / $540 <small ×> 12 = <b>$6,480</b> billed yearly */
    var tierPattern = /^(.*?)\s*(\$[\d,]+(?:\.\d+)?)\s*(\/\s*\w+)?\s*(?:\(([^)]*)\))?\s*$/;

    function esc(str) {
      /* escape via the DOM (no &-entities in the source, so the CMS can't mangle them) */
      var d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    function noteHTML(text) {
      return esc(text)
        .replace(/(\d)\s*[x\u00d7]\s*(?=\$?\d)/gi, '$1 <span class="tier-times">\u00d7</span> ') /* small × */
        .replace(/=\s*(\$[\d,]+(?:\.\d+)?)/, '= <b>$1</b>');                                    /* bold total */
    }

    var tierSpans = form.querySelectorAll('#cid_95 .form-radio-item label span, #cid_96 .form-radio-item label span');
    for (var j = 0; j < tierSpans.length; j++) {
      var span = tierSpans[j];
      var m = span.textContent.replace(/^\s+|\s+$/g, '').match(tierPattern);
      if (!m) continue;

      var price = el('span', 'tier-price');
      price.appendChild(el('b', '', m[2]));
      if (m[3]) price.appendChild(el('small', '', m[3].replace(/\s+/g, '')));

      span.textContent = '';
      span.className += ' tier';
      if (m[1]) span.appendChild(el('span', 'tier-name', m[1]));
      span.appendChild(price);
      if (m[4]) {
        var note = el('em', 'tier-note');
        note.innerHTML = noteHTML(m[4]);
        span.appendChild(note);
      }
    }

    /* 4. "Other" amount (Monthly 95 + Annually 96):
          - clicking the row selects Other and focuses the box
          - picking a tier card clears whatever was typed in Other */
    var others = [
      { id: '95', placeholder: 'Other monthly amount' },
      { id: '96', placeholder: 'Other yearly amount' }
    ];
    for (var o = 0; o < others.length; o++) {
      (function (cfg) {
        var otherRadio = form.querySelector('#other_' + cfg.id);
        var otherInput = form.querySelector('#input_' + cfg.id);
        if (!otherRadio || !otherInput) return;
        otherInput.placeholder = cfg.placeholder;
        otherInput.setAttribute('inputmode', 'decimal');
        otherRadio.closest('.form-radio-item').addEventListener('click', function () {
          if (!otherRadio.checked) otherRadio.click();
          otherInput.disabled = false;
          otherInput.focus();
        });
        var tiers = form.querySelectorAll('#cid_' + cfg.id + ' input[type="radio"]:not(.form-radio-other)');
        for (var t = 0; t < tiers.length; t++) {
          tiers[t].addEventListener('change', function () {
            if (this.checked && otherInput.value !== '') {
              otherInput.value = '';
              fire(otherInput, 'input');
              fire(otherInput, 'change');
            }
          });
        }
      })(others[o]);
    }

    /* 5. Frequency toggle: clear the hidden tier + keep recurring checkbox (90) in sync */
    var recurring = form.querySelector('#input_90');

    function clearChoice(cid) {
      var inputs = form.querySelectorAll('#' + cid + ' input');
      for (var k = 0; k < inputs.length; k++) {
        var input = inputs[k];
        if (input.type === 'radio' && input.checked) {
          input.checked = false;
          fire(input, 'change');
        } else if (input.type === 'text' && input.value !== '') {
          input.value = '';
          fire(input, 'input');
          fire(input, 'change');
        }
      }
    }

    function syncRecurring(isMonthly) {
      if (recurring && recurring.checked !== isMonthly) recurring.click();
    }

    var freq = form.querySelectorAll('#cid_93 input[type="radio"]');
    for (var f = 0; f < freq.length; f++) {
      freq[f].addEventListener('change', function () {
        var isMonthly = this.value === 'Monthly';
        clearChoice(isMonthly ? 'cid_96' : 'cid_95');
        syncRecurring(isMonthly);
      });
      if (freq[f].checked) syncRecurring(freq[f].value === 'Monthly');
    }

    return true;
  }

  /* Run now if the page is already loaded, otherwise on DOMContentLoaded.
     Keeps retrying for ~10s in case the form renders late. */
  function start() {
    if (init()) return;
    var tries = 0;
    var timer = setInterval(function () {
      if (init() || ++tries > 40) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
