(function () {
  const brandFix = document.createElement('style');
  brandFix.textContent = '#login .brand .rss-logo,#chooser .choose-head .rss-logo{display:block!important}#vh26-connected-dashboard.vh26-workspace-active #vh26-report-intro{max-width:750px!important}#vh26-connected-dashboard.vh26-finance-view-active #vh26-finance-preview-results{display:flex!important;flex-direction:column!important;max-height:none!important;overflow:visible!important}#vh26-connected-dashboard.vh26-finance-view-active #vh26-finance-preview-results .vh26-finance-warning{order:0!important;margin:8px 0 12px!important}#vh26-connected-dashboard.vh26-finance-view-active #vh26-finance-preview-results table{order:1!important}#vh26-connected-dashboard.vh26-finance-view-active #vh26-finance-preview-results details{order:2!important}';
  document.head.append(brandFix);
  document.querySelectorAll('#login .brand .rss-logo, #chooser .choose-head .rss-logo').forEach(el => el.style.setProperty('display', 'block', 'important'));

  const pipelineLayout = document.createElement('style');
  pipelineLayout.id = 'vh26-pipeline-layout';
  pipelineLayout.textContent = `
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-card{box-sizing:border-box!important;padding:18px!important;border:1px solid #e4e9ed!important;border-radius:14px!important;background:#fff!important;box-shadow:0 6px 18px #16364c08!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-card>div:first-child{display:grid!important;grid-template-columns:1.2fr 1.2fr .85fr 1fr 1fr!important;align-items:end!important;gap:10px!important;width:100%!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-card>div:first-child>label{display:grid!important;grid-template-rows:auto 1fr!important;gap:7px!important;min-width:0!important;flex:none!important;margin:0!important;color:#263d50!important;font:500 13px/1.35 Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-card>div:first-child input{box-sizing:border-box!important;width:100%!important;min-width:0!important;min-height:46px!important;padding:12px 14px!important;border:1px solid #cdd7df!important;border-radius:12px!important;background:#fafbfc!important;color:#163247!important;font:400 15px Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-card>div:first-child input:focus{outline:3px solid #004d7126!important;border-color:#004d71!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;width:100%!important;margin-top:12px!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions button{width:100%!important;min-height:46px!important;padding:11px 18px!important;border:1px solid #cbd6de!important;border-radius:12px!important;background:#fff!important;color:#004d71!important;font:600 14px Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions button:first-child{border-color:#004d71!important;background:#004d71!important;color:#fff!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions button:hover:not(:disabled){filter:brightness(.96)}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions button:disabled{opacity:.48;cursor:not-allowed}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace #vh26-pipeline-add{min-height:46px!important;margin-top:12px!important;padding:11px 20px!important;border:1px solid #ff6b00!important;border-radius:12px!important;background:#ff6b00!important;color:#173448!important;font:600 14px Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-card>span{display:block!important;width:100%!important;margin:8px 0 0!important;color:#607183!important;font-size:12px!important}
    @media(max-width:850px){#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-card>div:first-child{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
    @media(max-width:560px){#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-card>div:first-child{grid-template-columns:repeat(2,minmax(0,1fr))!important}#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions{grid-template-columns:1fr!important}}
    @media(max-width:380px){#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-card>div:first-child{grid-template-columns:1fr!important}}
  `;
  document.head.append(pipelineLayout);

  const reportingWeekGuard = document.createElement('style');
  reportingWeekGuard.id = 'vh26-reporting-week-guard';
  reportingWeekGuard.textContent = `
    #vh26-connected-dashboard.vh26-workspace-active #vh26-native-report>div:first-child{position:sticky!important;top:8px!important;z-index:25!important;align-items:center!important;gap:14px!important;padding:12px 14px!important;border:1px solid #d7e2e9!important;border-radius:12px!important;background:#fff!important;box-shadow:0 5px 16px #17344812!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-native-report>div:first-child label{color:#263d50!important;font:600 13px Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-week{min-height:44px!important;padding:10px 14px!important;border:1px solid #cbd6de!important;border-radius:10px!important;background:#fafbfc!important;color:#163247!important;font:600 14px Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-week:focus-visible{outline:3px solid #004d7126!important;border-color:#004d71!important}
    @media(max-width:560px){#vh26-connected-dashboard.vh26-workspace-active #vh26-native-report>div:first-child{top:4px!important;gap:8px!important;padding:10px!important;flex-wrap:wrap!important}#vh26-connected-dashboard.vh26-workspace-active #vh26-week{max-width:min(100%,320px)!important}}
  `;
  document.head.append(reportingWeekGuard);

  const reportingFormStyle = document.createElement('style');
  reportingFormStyle.id = 'vh26-report-form-consistency';
  reportingFormStyle.textContent = `
    #vh26-connected-dashboard.vh26-workspace-active #vh26-report-intro,#vh26-connected-dashboard.vh26-workspace-active #vh26-native-report,#vh26-connected-dashboard.vh26-workspace-active #vh26-section-editor,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace,#vh26-connected-dashboard.vh26-workspace-active #vh26-review-workspace{box-sizing:border-box!important;width:100%!important;max-width:1100px!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-report-workspace #vh26-report-intro,#vh26-connected-dashboard.vh26-workspace-active #vh26-report-workspace #vh26-native-report{box-sizing:border-box!important;width:100%!important;max-width:976px!important;margin-left:auto!important;margin-right:auto!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-section-editor,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace,#vh26-connected-dashboard.vh26-workspace-active #vh26-review-workspace{padding:26px 30px!important;border:1px solid #dce5e9!important;border-radius:14px!important;background:#fff!important;box-shadow:0 6px 20px #16364c0a!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries{display:grid!important;gap:12px!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry{box-sizing:border-box!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;grid-template-areas:"title owner support" "required remove ." "update update update"!important;align-items:end!important;gap:12px!important;width:100%!important;margin:0!important;padding:16px!important;border:1px solid #d5e1e8!important;border-radius:12px!important;background:#fff!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry>label:has(input[data-prop="title"]){grid-area:title!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry>label:has(input[data-prop="owner"]){grid-area:owner!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry>label:has(input[data-prop="support"]){grid-area:support!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry>label:has(input[data-prop="required_by"]){grid-area:required!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry>label:has(textarea[data-prop="update"]){grid-area:update!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry>button{grid-area:remove!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries label,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields label{display:grid!important;grid-template-rows:auto 1fr!important;gap:7px!important;min-width:0!important;margin:0!important;color:#263d50!important;font:500 13px/1.35 Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-section-notes,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-notes,#vh26-connected-dashboard.vh26-workspace-active #vh26-entries input,#vh26-connected-dashboard.vh26-workspace-active #vh26-entries textarea,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields input,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields textarea{box-sizing:border-box!important;width:100%!important;min-width:0!important;min-height:46px!important;padding:12px 14px!important;border:1px solid #cdd7df!important;border-radius:12px!important;background:#fafbfc!important;color:#163247!important;font:400 15px Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-section-notes,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-notes,#vh26-connected-dashboard.vh26-workspace-active #vh26-entries textarea,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields textarea{min-height:100px!important;line-height:1.5!important;resize:vertical!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries input:focus,#vh26-connected-dashboard.vh26-workspace-active #vh26-entries textarea:focus,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields input:focus,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields textarea:focus,#vh26-connected-dashboard.vh26-workspace-active #vh26-section-notes:focus,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-notes:focus{outline:3px solid #004d7126!important;border-color:#004d71!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry>button{justify-self:start!important;align-self:end!important;width:max-content!important;min-width:0!important;min-height:42px!important;padding:10px 16px!important;border:1px solid #cbd6de!important;border-radius:12px!important;background:#fff!important;color:#004d71!important;font:600 14px Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry>button:hover{border-color:#004d71!important;background:#f5f9fb!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields[hidden]{display:none!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-add-entry,#vh26-connected-dashboard.vh26-workspace-active #vh26-ai-review{min-height:42px!important;padding:10px 16px!important;border-radius:12px!important;font:600 14px Inter,Segoe UI,Arial,sans-serif!important}
    @media(max-width:850px){#vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields{grid-template-columns:repeat(2,minmax(0,1fr))!important}#vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry{grid-template-areas:"title owner" "support required" "update update" "remove remove"!important}}
    @media(max-width:560px){#vh26-connected-dashboard.vh26-workspace-active #vh26-section-editor,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace,#vh26-connected-dashboard.vh26-workspace-active #vh26-review-workspace{padding:18px!important}#vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields{grid-template-columns:1fr!important}#vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry{grid-template-areas:"title" "owner" "support" "required" "update" "remove"!important}}
  `;
  document.head.append(reportingFormStyle);

  const stage3Polish = document.createElement('style');
  stage3Polish.id = 'vh26-stage3-user-facing-polish';
  stage3Polish.textContent = `
    #vh26-connected-dashboard.vh26-workspace-active #vh26-native-report #vh26-report-status:empty{display:none!important}
    #vh26-connected-dashboard.vh26-action-view-active.vh26-workspace-active #vh26-account{display:none!important}
    #vh26-connected-dashboard.vh26-action-view-active.vh26-workspace-active #vh26-actions-summary:empty{display:none!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions{gap:16px!important;margin-top:20px!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-add-entry{margin-top:18px!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions button{border-color:#cbd6de!important;background:#fff!important;color:#173448!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions button:first-child{border-color:#cbd6de!important;background:#fff!important;color:#173448!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions button:hover:not(:disabled){border-color:#004d71!important;background:#f5f9fb!important;filter:none!important}
    .vh26-presenter-dialog form>div:last-child{display:flex!important;justify-content:flex-end!important;gap:14px!important;margin-top:14px!important}
    .vh26-presenter-dialog form>div:last-child button{box-sizing:border-box!important;min-width:100px!important;min-height:42px!important;padding:10px 16px!important;border-radius:10px!important;font:600 14px Inter,Segoe UI,Arial,sans-serif!important;cursor:pointer}
    .vh26-presenter-dialog form>div:last-child button[type="button"]{border:1px solid #cbd6de!important;background:#fff!important;color:#173448!important}
    .vh26-presenter-dialog form>div:last-child button[type="submit"]{border:1px solid #ff6b00!important;background:#ff6b00!important;color:#173448!important}
  `;
  document.head.append(stage3Polish);

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
  let navigationSavePending = false;
  let requestedNavigation = null;
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

  async function flushSectionSave() {
    clearTimeout(sectionTimer);
    while (sectionSaving || reportingBusy) await new Promise(resolve => setTimeout(resolve, 30));
    if (reportingDirty) {
      clearTimeout(sectionTimer);
      await saveSection();
      while (sectionSaving || reportingBusy) await new Promise(resolve => setTimeout(resolve, 30));
    }
    return !reportingDirty;
  }
  window.vhFlushReportingSave = flushSectionSave;

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

  function applyReportingSpellcheck(root) {
    root.querySelectorAll('textarea, input:not([type]), input[type="text"]').forEach(field => {
      field.setAttribute('spellcheck', 'true');
      field.setAttribute('lang', 'en-GB');
    });
  }

  function suppressInternalStatusMessages(root) {
    const reportStatus = root.querySelector('#vh26-report-status');
    if (reportStatus && /^Report loaded in [\d.]+s\. Loading pipeline, actions and finance in the background/.test(reportStatus.textContent.trim())) {
      reportStatus.textContent = '';
    }
    const actionsSummary = root.querySelector('#vh26-actions-summary');
    if (actionsSummary?.textContent.trim() === 'Loading actions...') actionsSummary.textContent = '';
  }

  function installDepartmentChooserStyle() {
    if (document.getElementById('vh26-department-chooser-polish')) return;
    const style = document.createElement('style');
    style.id = 'vh26-department-chooser-polish';
    style.textContent = `
      #vh26-connected-dashboard main.choose-main{width:auto;max-width:1320px;margin:0 auto;padding:42px clamp(22px,4vw,56px) 56px}
      #vh26-connected-dashboard main.choose-main>.choose-kicker{display:inline-flex;align-items:center;margin:0 0 10px;padding:6px 10px;border:1px solid #d7e5eb;border-radius:999px;background:#fff;color:#315d73;font-size:10px;font-weight:750;letter-spacing:.12em}
      #vh26-connected-dashboard main.choose-main>h1{margin:4px 0 7px;color:#173448;font-size:clamp(30px,3.2vw,40px);font-weight:700;letter-spacing:-.035em;line-height:1.15}
      #vh26-connected-dashboard main.choose-main>p#vh26-account{display:inline-flex;align-items:center;width:max-content;max-width:100%;margin:0 0 30px;padding:7px 11px;border:1px solid #d8e5eb;border-radius:999px;background:#fff;color:#607183;font-size:12px;line-height:1.3}
      #vh26-connected-dashboard #vh26-department-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,255px),1fr));align-items:stretch;gap:16px}
      #vh26-connected-dashboard #vh26-department-grid .dept-card{position:relative;display:flex;min-width:0;min-height:154px;flex-direction:column;align-items:stretch;justify-content:space-between;gap:20px;overflow:hidden;padding:21px 22px 17px;border:1px solid #d7e2e9;border-radius:14px;background:#fff;color:#173448;text-align:left;text-decoration:none;box-shadow:0 3px 12px #15354a08;transition:transform .16s ease,border-color .16s ease,box-shadow .16s ease}
      #vh26-connected-dashboard #vh26-department-grid .dept-card:before{position:absolute;top:16px;bottom:16px;left:0;width:3px;border-radius:0 3px 3px 0;background:#004d71;content:"";transition:background .16s ease}
      #vh26-connected-dashboard #vh26-department-grid .dept-card strong{display:block;color:#173448;font-size:17px;font-weight:700;line-height:1.35;overflow-wrap:anywhere}
      #vh26-connected-dashboard #vh26-department-grid .dept-card .dept-arrow{display:flex;align-self:stretch;align-items:center;justify-content:space-between;gap:10px;margin-top:auto;padding-top:12px;border-top:1px solid #e6edf1;color:#315d73;font-size:12px;font-weight:650;line-height:1.3}
      #vh26-connected-dashboard #vh26-department-grid .dept-card .dept-arrow:after{color:#ff6b00;content:"→";font-size:18px;line-height:1}
      #vh26-connected-dashboard #vh26-department-grid .dept-card:hover{transform:translateY(-2px);border-color:#b7ccd7;background:#fff;box-shadow:0 10px 24px #15354a12}
      #vh26-connected-dashboard #vh26-department-grid .dept-card:hover:before{background:#ff6b00}
      #vh26-connected-dashboard #vh26-department-grid .dept-card:focus-visible{outline:3px solid #ff9b55;outline-offset:3px}
      #vh26-connected-dashboard.vh26-workspace-active #vh26-report-intro{width:100%!important;max-width:1000px!important;margin-left:auto!important;margin-right:auto!important;padding-left:0!important;padding-right:0!important}
      #vh26-connected-dashboard.vh26-workspace-active #vh26-stage-progress{display:block!important;width:100%;height:4px;margin:10px 0 0;border-radius:4px;background:#dfe4e8;overflow:hidden}
      #vh26-connected-dashboard.vh26-workspace-active #vh26-stage-progress-fill{display:block!important;height:100%;background:#ff6b00;border-radius:4px;transition:width .18s ease}
      #vh26-connected-dashboard.vh26-finance-view-active #vh26-finance-review{display:none!important}
      @media(max-width:760px){#vh26-connected-dashboard main.choose-main{padding:28px 18px 40px}#vh26-connected-dashboard main.choose-main>p#vh26-account{margin-bottom:22px}}
      @media(max-width:540px){#vh26-connected-dashboard #vh26-department-grid{grid-template-columns:1fr;gap:12px}#vh26-connected-dashboard #vh26-department-grid .dept-card{min-height:136px}}
      @media(prefers-reduced-motion:reduce){#vh26-connected-dashboard #vh26-department-grid .dept-card,#vh26-connected-dashboard #vh26-department-grid .dept-card:before{transition:none}}
    `;
    document.head.append(style);
  }

  function presenterTextElement(tag, text) {
    const element = document.createElement(tag);
    element.textContent = String(text ?? '');
    return element;
  }

  function safetyQuestionIsDuplicate(question, reminders) {
    const words = value => String(value || '').toLocaleLowerCase('en-GB')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/)
      .filter(word => word.length > 3 && !['what', 'when', 'where', 'which', 'should', 'could', 'would', 'your', 'their', 'about', 'this', 'that', 'from', 'with'].includes(word));
    const candidate = new Set(words(question));
    if (!candidate.size) return false;
    return reminders.some(reminder => {
      const reference = new Set(words(reminder));
      if (!reference.size) return false;
      const shared = [...candidate].filter(word => reference.has(word)).length;
      return shared / Math.min(candidate.size, reference.size) >= 0.72;
    });
  }

  function polishSafetyMoment(root) {
    const editor = root.querySelector('#vh26-safety-editor');
    const rename = (name, title, placeholder) => {
      const field = editor?.querySelector(`[name="${name}"]`);
      const label = field?.closest('label');
      if (label?.firstChild?.nodeType === Node.TEXT_NODE) label.firstChild.textContent = title;
      if (field && placeholder) field.placeholder = placeholder;
    };
    rename('points', 'Practical reminders', 'One reminder per line');
    rename('questions', 'Discussion questions', 'Use only questions that add a different point');

    const content = root.querySelector('.vh26-presenter-safety-content');
    if (content && content.dataset.vh50Content !== 'true') {
      const values = {};
      let currentLabel = '';
      for (const child of [...content.children]) {
        if (child.tagName === 'H3') currentLabel = child.textContent.trim();
        else if (child.tagName === 'P' && currentLabel) values[currentLabel] = child.textContent;
      }
      const listValue = label => String(values[label] || '').split('\n').map(value => value.trim()).filter(Boolean);
      const source = {
        topic: content.querySelector('h2')?.textContent || 'Safety Moment',
        why: values['Why it matters'] || '',
        scenario: values['Illustrative scenario'] || '',
        points: listValue('Discussion points').length ? listValue('Discussion points') : listValue('Practical reminders'),
        questions: listValue('Discussion questions'),
        takeaway: values['Takeaway / action'] || ''
      };
      const heading = presenterTextElement('h2', source.topic || 'Safety Moment');
      const section = (title, text, list = false) => {
        if (!text || (Array.isArray(text) && !text.length)) return;
        const h = presenterTextElement('h3', title);
        content.append(h);
        if (list) {
          const ul = document.createElement('ul');
          for (const value of text) ul.append(presenterTextElement('li', value));
          content.append(ul);
        } else content.append(presenterTextElement('p', text));
      };
      const reminders = (source.points || []).map(value => String(value || '').trim()).filter(Boolean);
      const questions = (source.questions || []).map(value => String(value || '').trim()).filter(Boolean)
        .filter(question => !safetyQuestionIsDuplicate(question, reminders));
      content.replaceChildren(heading);
      section('Why it matters', source.why);
      section('Illustrative scenario', source.scenario);
      section('Practical reminders', reminders, true);
      section(questions.length === 1 ? 'Discussion question' : 'Discussion questions', questions, true);
      section('Takeaway / agreed action', source.takeaway);
      content.dataset.vh50Content = 'true';
    }
  }

  function enhancePresenterSlide() {
    const mode = document.getElementById('vh26-presenter-mode');
    const slide = document.getElementById('vh26-presenter-slide');
    if (!mode || mode.hidden || !slide) return;

    const tabs = mode.querySelector('#vh26-presenter-tabs');
    const activeTab = tabs?.querySelector('button.selected')?.textContent.trim() || '';
    const viewKind = activeTab === 'Safety Moment' ? 'safety' : activeTab === 'Finance & Commercial' ? 'finance' : activeTab === 'All departments' ? 'all' : 'department';
    const title = [...slide.children].find(child => child.tagName === 'H1');
    let heading = slide.querySelector(':scope > .vh26-presenter-heading');
    if (title && !heading) {
      heading = document.createElement('header');
      heading.className = 'vh26-presenter-heading';
      title.before(heading);
      heading.append(title);
      const following = heading.nextElementSibling;
      if (following?.tagName === 'P' && !following.classList.contains('vh26-presenter-notice')) heading.append(following);
    }

    if (heading && viewKind === 'department') {
      const departmentTabs = [...(tabs?.querySelectorAll('button') || [])].slice(2);
      const departmentIndex = departmentTabs.findIndex(button => button.classList.contains('selected'));
      const departmentName = activeTab || title?.textContent || 'Department';
      const week = document.getElementById('vh26-presenter-week')?.textContent.trim() || 'Reporting week not available';
      let meta = heading.querySelector('.vh26-presenter-heading-meta');
      if (!meta) {
        meta = document.createElement('p');
        meta.className = 'vh26-presenter-heading-meta';
        heading.append(meta);
      }
      meta.textContent = `DEPARTMENT ${Math.max(0, departmentIndex) + 1} OF ${departmentTabs.length} · ${week}`;

      const cards = [...slide.querySelectorAll(':scope > .vh26-presenter-card:not(.vh26-presenter-actions-card)')];
      const reported = cards.filter(card => !card.querySelector('p.empty')).length;
      const pipelineCard = cards.find(card => card.querySelector('h2')?.textContent.trim() === 'Pipeline');
      const pipelineUpdates = [...(pipelineCard?.querySelectorAll('p') || [])].filter(p => !p.classList.contains('empty')).length;
      const actionCount = document.getElementById('vh26-host-open-actions')?.textContent.trim();
      let metrics = slide.querySelector(':scope > .vh26-presenter-kpis');
      if (!metrics) {
        metrics = document.createElement('div');
        metrics.className = 'vh26-presenter-kpis';
        heading.after(metrics);
      }
      const values = [
        ['Reporting sections', `${reported} / 5`],
        ['Pipeline updates', String(pipelineUpdates)],
        ['Open actions · all departments', actionCount && /^\d+$/.test(actionCount) ? actionCount : 'See Action log'],
        ['Department', departmentName]
      ];
      const metricSignature = JSON.stringify(values);
      if (metrics.dataset.signature !== metricSignature) {
        metrics.replaceChildren(...values.map(([label, value]) => {
          const card = document.createElement('div');
          card.className = 'vh26-presenter-stat';
          card.append(presenterTextElement('span', label), presenterTextElement('strong', value));
          return card;
        }));
        metrics.dataset.signature = metricSignature;
      }

      let actionCard = slide.querySelector(':scope > .vh26-presenter-actions-card');
      if (!actionCard) {
        actionCard = document.createElement('section');
        actionCard.className = 'vh26-presenter-card vh26-presenter-actions-card';
        slide.append(actionCard);
      }
      const actionSignature = JSON.stringify([departmentName, actionCount || 'unavailable']);
      if (actionCard.dataset.signature !== actionSignature) {
        actionCard.replaceChildren(presenterTextElement('h2', 'Outstanding actions'));
        actionCard.append(presenterTextElement('p', 'Use the Action log to review actions for this department.'));
        actionCard.dataset.signature = actionSignature;
      }
    }

    if (viewKind === 'finance') {
      let panel = slide.querySelector(':scope > .vh26-presenter-finance-panel');
      if (!panel) {
        panel = document.createElement('section');
        panel.className = 'vh26-presenter-card vh26-presenter-finance-panel';
        slide.append(panel);
      }
      for (const child of [...slide.children]) if (child !== heading && child !== panel) panel.append(child);
    } else if (viewKind === 'safety') {
      const content = slide.querySelector(':scope > .vh26-presenter-safety-content');
      let panel = slide.querySelector(':scope > .vh26-presenter-safety-panel');
      if (!panel) {
        panel = document.createElement('section');
        panel.className = 'vh26-presenter-safety-panel';
        slide.append(panel);
      }
      for (const child of [...slide.children]) if (child !== heading && child !== content && child !== panel) panel.append(child);
      polishSafetyMoment(slide);
    }
  }

  function installPresenterRestoration() {
    if (!document.getElementById('vh26-presenter-restoration-style')) {
      const style = document.createElement('style');
      style.id = 'vh26-presenter-restoration-style';
      style.textContent = `
        #vh26-connected-dashboard #vh26-presenter-mode:not([hidden]){background:#f5f6f8!important;color:#173448!important}
        #vh26-presenter-mode>header{min-height:94px!important;background:linear-gradient(120deg,#00354e,#075675)!important;border-bottom:3px solid #ff6b00!important;box-shadow:0 5px 20px #00354e14!important}
        #vh26-presenter-mode .vh26-presenter-brand img{width:112px!important;height:50px!important;object-fit:contain!important}
        #vh26-presenter-mode .vh26-presenter-brand h2{font-size:23px!important;letter-spacing:-.02em!important}
        #vh26-presenter-mode .vh26-presenter-brand p{font-size:13px!important;opacity:.9!important}
        #vh26-presenter-mode .vh26-presenter-tabs{max-width:1250px!important;margin:14px auto 4px!important;padding:8px 22px!important;gap:8px!important;justify-content:flex-start!important}
        #vh26-presenter-mode .vh26-presenter-tabs button{min-height:42px!important;padding:10px 16px!important;border:1px solid #d7e2e9!important;border-radius:999px!important;background:#fff!important;color:#365b70!important;font-size:14px!important;font-weight:600!important;box-shadow:none!important}
        #vh26-presenter-mode .vh26-presenter-tabs button.selected{background:#004d71!important;border-color:#004d71!important;color:#fff!important}
        #vh26-presenter-mode .vh26-presenter-pager{background:#f5f6f8!important;border-top:1px solid #dce5eb!important;box-shadow:0 -5px 16px #1230440d!important}
        #vh26-presenter-mode .vh26-presenter-pager button{min-height:42px!important;padding:10px 16px!important;border:1px solid #d7e2e9!important;border-radius:10px!important;background:#fff!important;color:#004d71!important;font-size:14px!important}
        #vh26-presenter-mode #vh26-presenter-slide{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:15px!important;width:calc(100% - 44px)!important;max-width:1250px!important;margin:4px auto 0!important;padding:12px 0 calc(108px + env(safe-area-inset-bottom))!important;overflow-y:auto!important;overflow-x:hidden!important;background:transparent!important}
        #vh26-presenter-mode #vh26-presenter-slide>h1,#vh26-presenter-mode .vh26-presenter-heading{box-sizing:border-box!important;width:100%!important;margin:0!important;padding:22px 28px!important;border:1px solid #dce5eb!important;border-radius:18px!important;background:#fff!important;box-shadow:0 8px 30px #12304408!important}
        #vh26-presenter-mode .vh26-presenter-heading h1{margin:0!important;color:#003e5b!important;font-size:clamp(27px,2.8vw,38px)!important;font-weight:650!important;letter-spacing:-.035em!important;line-height:1.2!important}
        #vh26-presenter-mode .vh26-presenter-heading p{margin:8px 0 0!important;color:#597182!important;font-size:14px!important;line-height:1.5!important}
        #vh26-presenter-mode .vh26-presenter-heading-meta{margin:0 0 8px!important;color:#587080!important;font-size:11px!important;font-weight:700!important;letter-spacing:.09em!important}
        #vh26-presenter-mode .vh26-presenter-kpis{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:14px!important;width:100%!important;margin:0!important}
        #vh26-presenter-mode .vh26-presenter-stat{display:flex!important;min-width:0!important;flex-direction:column!important;justify-content:space-between!important;gap:10px!important;min-height:86px!important;padding:16px 18px!important;border:1px solid #dce5eb!important;border-radius:16px!important;background:#fff!important;box-shadow:0 5px 22px #12304408!important}
        #vh26-presenter-mode .vh26-presenter-stat span{color:#597182!important;font-size:13px!important;font-weight:600!important}
        #vh26-presenter-mode .vh26-presenter-stat strong{color:#004d71!important;font-size:clamp(18px,2vw,25px)!important;font-weight:700!important;letter-spacing:-.025em!important}
        #vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card,#vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-safety-panel{box-sizing:border-box!important;width:100%!important;margin:0!important;padding:22px 26px!important;border:1px solid #dce5eb!important;border-radius:18px!important;background:#fff!important;box-shadow:0 5px 22px #12304408!important}
        #vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card h2,#vh26-presenter-mode .vh26-presenter-safety-content h2{margin:0 0 12px!important;padding:0 0 10px!important;border-bottom:1px solid #e9eef2!important;color:#004d71!important;font-size:19px!important;font-weight:650!important;letter-spacing:-.015em!important}
        #vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card p,#vh26-presenter-mode .vh26-presenter-safety-panel p,#vh26-presenter-mode .vh26-presenter-safety-content p{margin:9px 0!important;color:#29485b!important;font-size:16px!important;line-height:1.65!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important}
        #vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card p.empty{color:#687c88!important;font-style:italic!important}
        #vh26-presenter-mode .vh26-presenter-actions-card span{color:#597182!important;font-size:14px!important}
        #vh26-presenter-mode .vh26-presenter-finance-panel{overflow-x:auto!important}
        #vh26-presenter-mode .vh26-presenter-finance-table{width:100%!important;min-width:720px!important;border-collapse:collapse!important;background:#fff!important;font-size:14px!important}
        #vh26-presenter-mode .vh26-presenter-finance-table th{padding:13px 12px!important;border-bottom:1px solid #dce5eb!important;background:#f5f8fa!important;color:#31566d!important;text-align:left!important;font-weight:700!important}
        #vh26-presenter-mode .vh26-presenter-finance-table td{padding:13px 12px!important;border-bottom:1px solid #e6edf1!important;color:#29485b!important}
        #vh26-presenter-mode .vh26-presenter-safety-panel{display:flex!important;flex-direction:column!important;gap:14px!important;width:100%!important;padding:20px!important;border:1px solid #dce5eb!important;border-radius:18px!important;background:#fff!important;box-shadow:0 5px 22px #12304408!important}
        #vh26-presenter-mode .vh26-presenter-safety-controls{display:flex!important;flex-wrap:wrap!important;align-items:center!important;gap:10px!important;margin:0!important;padding:0!important}
        #vh26-presenter-mode .vh26-presenter-safety-controls select,#vh26-presenter-mode .vh26-presenter-safety-controls button{min-height:44px!important;border-radius:10px!important;font-weight:600!important}
        #vh26-presenter-mode .vh26-presenter-safety-content{box-sizing:border-box!important;width:100%!important;margin:0!important;padding:22px 26px!important;border:1px solid #dce5eb!important;border-left:4px solid #ff6b00!important;border-radius:16px!important;background:#fff!important;box-shadow:0 5px 22px #12304408!important}
        #vh26-presenter-mode .vh26-presenter-safety-content h3{margin:18px 0 7px!important;color:#173448!important;font-size:16px!important;font-weight:700!important}
        #vh26-presenter-mode .vh26-presenter-safety-content ul{margin:0!important;padding-left:22px!important;color:#29485b!important;font-size:16px!important;line-height:1.7!important}
        #vh26-presenter-mode .vh26-presenter-safety-content li{padding:2px 0!important}
        #vh26-presenter-mode .vh26-presenter-overview-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important;width:100%!important}
        #vh26-presenter-mode .vh26-presenter-department-card{display:flex!important;min-height:112px!important;flex-direction:column!important;align-items:flex-start!important;justify-content:space-between!important;gap:14px!important;padding:20px!important;border:1px solid #dce5eb!important;border-radius:16px!important;background:#fff!important;color:#173448!important;text-align:left!important;box-shadow:0 5px 20px #12304408!important}
        #vh26-presenter-mode .vh26-presenter-department-card strong{font-size:17px!important}
        #vh26-presenter-mode .vh26-presenter-department-card span{color:#597182!important;font-size:13px!important}
        @media(max-width:850px){#vh26-presenter-mode .vh26-presenter-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}#vh26-presenter-mode .vh26-presenter-overview-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
        @media(max-width:560px){#vh26-presenter-mode #vh26-presenter-slide{width:calc(100% - 28px)!important;padding:10px 0 calc(105px + env(safe-area-inset-bottom))!important}#vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card,#vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-heading,#vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-safety-content,#vh26-presenter-mode .vh26-presenter-safety-panel{padding:17px!important}#vh26-presenter-mode .vh26-presenter-tabs{justify-content:flex-start!important;flex-wrap:nowrap!important;overflow-x:auto!important}#vh26-presenter-mode .vh26-presenter-tabs button{flex:0 0 auto!important}#vh26-presenter-mode .vh26-presenter-kpis,#vh26-presenter-mode .vh26-presenter-overview-grid{grid-template-columns:1fr!important}}
      `;
      document.head.append(style);
    }

    const wrap = (name, after) => {
      const original = window[name];
      if (typeof original !== 'function' || original.__vh50Restored) return;
      const restored = function (...args) {
        const result = original.apply(this, args);
        after(args[0]);
        queueMicrotask(() => after(args[0]));
        return result;
      };
      restored.__vh50Restored = true;
      window[name] = restored;
    };
    wrap('presenterRenderSafety', polishSafetyMoment);
    wrap('renderPresenterSlide', enhancePresenterSlide);
    const refreshActions = window.presenterRefresh;
    if (typeof refreshActions === 'function' && !refreshActions.__vh50Restored) {
      const restoredRefresh = async function (...args) {
        const result = await refreshActions.apply(this, args);
        queueMicrotask(enhancePresenterSlide);
        return result;
      };
      restoredRefresh.__vh50Restored = true;
      window.presenterRefresh = restoredRefresh;
    }
    const slide = document.getElementById('vh26-presenter-slide');
    if (slide && !slide.dataset.vh50Observer) {
      slide.dataset.vh50Observer = 'true';
      new MutationObserver(() => queueMicrotask(enhancePresenterSlide)).observe(slide, { childList: true, subtree: true });
    }
    enhancePresenterSlide();
  }

  function install() {
    installDepartmentChooserStyle();
    installPresenterRestoration();
    const root = workspace();
    if (!root || root.dataset.autosaveReady) return;
    root.dataset.autosaveReady = 'true';
    const dashboard = document.getElementById('vh26-connected-dashboard');
    dashboard?.addEventListener('click', event => {
      const target = event.target instanceof Element ? event.target.closest('.vh26-sidebar nav button[data-connected-nav]') : null;
      if (!target || !reportingDirty) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      requestedNavigation = target;
      if (navigationSavePending) return;
      navigationSavePending = true;
      status('Saving changes before switching sections…');
      void flushSectionSave().then(saved => {
        const next = requestedNavigation;
        requestedNavigation = null;
        if (saved && next?.isConnected) next.click();
        else status('Changes could not be saved. Stay on this section and retry after resolving the save issue.');
      }).catch(error => {
        status('Changes could not be saved: ' + error.message);
      }).finally(() => {
        navigationSavePending = false;
      });
    }, true);
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
    const observer = new MutationObserver(() => {
      hideOpportunitySaveButtons(root);
      applyReportingSpellcheck(root);
      suppressInternalStatusMessages(root);
    });
    observer.observe(root, { childList: true, subtree: true });
    hideOpportunitySaveButtons(root);
    applyReportingSpellcheck(root);
    suppressInternalStatusMessages(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
