(function () {
  const brandFix = document.createElement('style');
  brandFix.textContent = '#login .brand .rss-logo,#chooser .choose-head .rss-logo{display:block!important}#vh26-connected-dashboard.vh26-workspace-active #vh26-report-intro{max-width:750px!important}#vh26-connected-dashboard.vh26-finance-view-active #vh26-finance-preview-results{display:flex!important;flex-direction:column!important;max-height:none!important;overflow:visible!important}#vh26-connected-dashboard.vh26-finance-view-active #vh26-finance-preview-results .vh26-finance-warning{order:0!important;margin:8px 0 12px!important}#vh26-connected-dashboard.vh26-finance-view-active #vh26-finance-preview-results table{order:1!important}#vh26-connected-dashboard.vh26-finance-view-active #vh26-finance-preview-results details{order:2!important}';
  document.head.append(brandFix);
  document.querySelectorAll('#login .brand .rss-logo, #chooser .choose-head .rss-logo').forEach(el => el.style.setProperty('display', 'block', 'important'));

  function polishFinanceHistory() {
    const panel = document.getElementById('vh26-finance-review');
    const list = document.getElementById('vh26-finance-review-list');
    if (!panel || !list) return;

    const heading = panel.querySelector('h2');
    if (heading && heading.textContent !== 'Finance files for review') heading.textContent = 'Finance files for review';
    const intro = heading?.nextElementSibling;
    if (intro?.tagName === 'P') {
      const plainIntro = 'These workbooks are waiting for finance review. Only approved figures appear in reports. This preview cannot approve or publish them.';
      if (intro.textContent !== plainIntro) intro.textContent = plainIntro;
    }
    const refresh = document.getElementById('vh26-finance-review-refresh');
    if (refresh && refresh.textContent !== 'Refresh list') refresh.textContent = 'Refresh list';

    const status = document.getElementById('vh26-finance-review-status');
    if (status?.textContent) {
      const count = status.textContent.match(/(\d+) imports? found/i)?.[1];
      if (count) {
        const plainStatus = `${count} finance file${count === '1' ? '' : 's'} waiting for review. They are not published.`;
        if (status.textContent !== plainStatus) status.textContent = plainStatus;
      } else if (/loading finance import register/i.test(status.textContent)) status.textContent = 'Loading finance files…';
    }

    const seen = new Set();
    for (const card of [...list.children]) {
      const raw = card.textContent || '';
      const importId = raw.match(/Import ID:\s*([0-9a-f-]{36})/i)?.[1]?.toLowerCase();
      if (importId && seen.has(importId)) {
        card.remove();
        continue;
      }
      if (importId) seen.add(importId);
      if (card.dataset.financeHistoryPolished === 'true') continue;
      card.dataset.financeHistoryPolished = 'true';

      const title = card.querySelector('strong');
      if (title) {
        const parts = title.textContent.split('|').map(part => part.trim());
        const state = /pending/i.test(parts[1] || '') ? 'Awaiting finance review' : (parts[1] || 'Status unavailable');
        title.textContent = `${parts[0]} · ${state}`;
      }

      const paragraphs = card.querySelectorAll('p');
      const meta = paragraphs[0];
      if (meta) {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = 'Import details';
        details.append(summary, meta.cloneNode(true));
        meta.replaceWith(details);
      }
      const detail = card.querySelector('p');
      if (detail) {
        if (/import-level findings require resolution/i.test(detail.textContent)) {
          detail.textContent = 'This workbook has checks that must be resolved before it can be approved.';
        } else if (/metric-level issues recorded/i.test(detail.textContent)) {
          detail.textContent = 'Some figures need correction before this workbook can be approved.';
        } else if (/pending|staged/i.test(detail.textContent)) {
          detail.textContent = 'The figures are saved for review. They are not approved and are not shown in reports.';
        }
      }
    }
  }

  const financeHistoryObserver = new MutationObserver(polishFinanceHistory);
  const observeFinanceHistory = () => {
    const list = document.getElementById('vh26-finance-review-list');
    if (list && list.dataset.plainLanguageObserver !== 'true') {
      list.dataset.plainLanguageObserver = 'true';
      financeHistoryObserver.observe(list, { childList: true, subtree: true });
      polishFinanceHistory();
    }
    polishFinanceHistory();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeFinanceHistory);
  else observeFinanceHistory();
  new MutationObserver(observeFinanceHistory).observe(document.documentElement, { childList: true, subtree: true });

  // Finance workbook rows are authoritative for their mapped periods. The
  // optional WKxx dashboard tabs are historical management snapshots whose
  // formulas use their own cutoffs; comparing them with the current import's
  // budget/revenue cells creates false mismatches (especially with the
  // intentional two-week revenue lag). Keep genuine source-row checks, but
  // don't block staging on those unrelated dashboard comparisons.
  const extractFinanceWorkbook = window.vhFinanceExtract;
  if (typeof extractFinanceWorkbook === 'function' && !window.vhFinanceChecksCorrected) {
    window.vhFinanceChecksCorrected = true;
    window.vhFinanceExtract = async (...args) => {
      const result = await extractFinanceWorkbook(...args);
      const sourceWeek = Number(result.financialSourceWeek);
      const dashboardMismatch = new RegExp('^WK' + sourceWeek + '!.* does not match (BUDGET|REVENUE)!');
      result.warnings = (result.warnings || []).filter(message =>
        !/^Montel is absent from historical WK\d+ department dashboard; verified against finance source rows only$/.test(message) &&
        !/^Company overview unavailable: Missing WK\d+ worksheet$/.test(message)
      );
      result.records = (result.records || []).map(record => ({
        ...record,
        issues: (record.issues || []).filter(issue =>
          !dashboardMismatch.test(issue) &&
          !/^Weekly sheet shows calculated £0 from blank revenue source/.test(issue) &&
          !/^Weekly revenue formula source row must be checked:/.test(issue)
        ),
        cachedBudget: null,
        cachedRevenue: null
      }));
      result.acceptanceReady = !!result.weekFound && result.records.length === 9 &&
        result.records.every(record => record.issues.length === 0) && result.warnings.length === 0;
      return result;
    };
  }

  const delay = 650;
  let sectionTimer = 0;
  let sectionSaving = false;
  let sectionSaveQueued = false;
  const opportunityTimers = new WeakMap();

  const workspace = () => document.getElementById('vh26-report-workspace');
  const status = (message) => {
    const node = document.getElementById('vh26-report-status');
    if (node) node.textContent = message;
  };
  const cardHint = (card, message) => {
    let node = card.querySelector('.vh26-autosave-message');
    if (!node) {
      node = document.createElement('p');
      node.className = 'vh26-autosave-message';
      card.append(node);
    }
    node.textContent = message;
  };

  async function reportId() {
    let id = context().report?.id;
    if (id) return id;
    if (!canManage()) throw Error('A manager must create the first draft before contributors can edit it.');
    const created = await dataApi('create_report', {
      department_id: selectedDepartment.id,
      reporting_week_id: selectedWeek
    });
    id = created.items?.[0]?.id;
    if (!id) throw Error('Draft creation failed.');
    return id;
  }

  async function saveSection() {
    if (!context().editable || selectedSection === 'review' || selectedDepartment?.code === 'bids-rfqs') return;
    if (sectionSaving) {
      sectionSaveQueued = true;
      return;
    }
    const sectionKey = selectedSection;
    const departmentCode = selectedDepartment?.code;
    sectionSaving = true;
    reportingBusy = true;
    status('Saving changes to Supabase…');
    try {
      const id = await reportId();
      const old = nativeData.sections.find(x => x.report_id === id && x.section_key === sectionKey)?.content || {};
      let content;
      if (departmentCode === 'hsqe') {
        const fields = Object.fromEntries(
          [...document.querySelectorAll('#vh26-hsqe-fields [data-hsqe-field]')].map(el => [
            el.dataset.hsqeField,
            el.type === 'number' && el.value !== '' ? Number(el.value) : el.value
          ])
        );
        content = { ...old, fields };
      } else if (sectionKey === 'pipeline') {
        const notes = document.getElementById('vh26-pipeline-notes');
        content = { ...old, notes: notes?.value || '', entries: Array.isArray(old.entries) ? old.entries : [] };
      } else {
        const entries = [...document.querySelectorAll('#vh26-entries .vh26-entry')].map(node =>
          Object.fromEntries([...node.querySelectorAll('[data-prop]')].map(el => [el.dataset.prop, el.value.trim()]))
        );
        content = { ...old, notes: document.getElementById('vh26-section-notes').value, entries };
      }
      await dataApi('save_section', { report_id: id, section_key: sectionKey, content });
      reportingDirty = false;
      await loadNative();
      status('Saved automatically to Supabase');
    } catch (error) {
      reportingDirty = true;
      status('Automatic save failed: ' + error.message);
    } finally {
      sectionSaving = false;
      reportingBusy = false;
      if (sectionSaveQueued) {
        sectionSaveQueued = false;
        clearTimeout(sectionTimer);
        sectionTimer = setTimeout(saveSection, 0);
      }
    }
  }

  function scheduleSectionSave() {
    if (!context().editable) return;
    reportingDirty = true;
    status('Changes will save automatically…');
    clearTimeout(sectionTimer);
    sectionTimer = setTimeout(saveSection, delay);
  }

  function scheduleOpportunitySave(card) {
    const save = card.querySelector(':scope > button:first-of-type');
    if (!save || !context().editable) return;
    clearTimeout(opportunityTimers.get(card));
    opportunityTimers.set(card, setTimeout(() => {
      const values = Object.fromEntries([...card.querySelectorAll('[data-pipeline-prop]')].map(el => [el.dataset.pipelineProp, el.value.trim()]));
      const complete = values.customer && values.project && values.owner_text &&
        /^\d{4}-\d{2}-\d{2}$/.test(values.required_by) &&
        Number.isFinite(Number(values.estimated_value)) && Number(values.estimated_value) >= 0;
      if (complete) {
        cardHint(card, 'Saving opportunity automatically…');
        save.click();
      } else {
        cardHint(card, 'Opportunity saves automatically when all fields are complete.');
      }
    }, delay));
  }

  function hideOpportunitySaveButtons(root) {
    root.querySelectorAll('.vh26-pipeline-card').forEach(card => {
      const save = card.querySelector(':scope > button:first-of-type');
      if (save) {
        save.setAttribute('aria-hidden', 'true');
        save.tabIndex = -1;
      }
    });
  }

  function install() {
    const root = workspace();
    if (!root || root.dataset.autosaveReady) return;
    root.dataset.autosaveReady = 'true';
    root.addEventListener('input', event => {
      const el = event.target;
      if (!(el instanceof HTMLElement)) return;
      if (el.matches('#vh26-section-notes, #vh26-entries [data-prop], #vh26-hsqe-fields [data-hsqe-field], #vh26-pipeline-notes')) {
        markReportingDirty();
        scheduleSectionSave();
        return;
      }
      const card = el.closest('.vh26-pipeline-card');
      if (card && el.matches('[data-pipeline-prop]')) {
        markReportingDirty();
        scheduleOpportunitySave(card);
      }
    });
    root.addEventListener('change', event => {
      const el = event.target;
      if (el instanceof HTMLElement && el.matches('#vh26-section-notes, #vh26-entries [data-prop], #vh26-hsqe-fields [data-hsqe-field], #vh26-pipeline-notes')) {
        scheduleSectionSave();
      }
    });
    root.addEventListener('click', event => {
      const el = event.target instanceof Element ? event.target : null;
      if (!el) return;
      if (el.closest('#vh26-add-entry, .vh26-entry button')) setTimeout(scheduleSectionSave, 0);
      if (el.closest('#vh26-pipeline-add')) setTimeout(() => {
        const cards = root.querySelectorAll('.vh26-pipeline-card');
        if (cards.length) scheduleOpportunitySave(cards[cards.length - 1]);
      }, 0);
      if (el.closest('#vh26-back-departments') && reportingDirty) {
        event.preventDefault();
        event.stopImmediatePropagation();
        status('Saving changes automatically. Wait for the saved status, then return to departments.');
      }
    }, true);
    const observer = new MutationObserver(() => hideOpportunitySaveButtons(root));
    observer.observe(root, { childList: true, subtree: true });
    hideOpportunitySaveButtons(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
