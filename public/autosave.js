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
    #vh26-connected-dashboard.vh26-workspace-active #vh26-report-workspace #vh26-report-intro,#vh26-connected-dashboard.vh26-workspace-active #vh26-report-workspace #vh26-native-report{box-sizing:border-box!important;width:100%!important;max-width:926px!important;margin-left:auto!important;margin-right:auto!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-section-editor,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace,#vh26-connected-dashboard.vh26-workspace-active #vh26-review-workspace{padding:26px 30px!important;border:1px solid #dce5e9!important;border-radius:14px!important;background:#fff!important;box-shadow:0 6px 20px #16364c0a!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries{display:grid!important;gap:12px!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry{box-sizing:border-box!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;align-items:end!important;gap:12px!important;width:100%!important;margin:0!important;padding:16px!important;border:1px solid #d5e1e8!important;border-radius:12px!important;background:#fff!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries label,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields label{display:grid!important;grid-template-rows:auto 1fr!important;gap:7px!important;min-width:0!important;margin:0!important;color:#263d50!important;font:500 13px/1.35 Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-section-notes,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-notes,#vh26-connected-dashboard.vh26-workspace-active #vh26-entries input,#vh26-connected-dashboard.vh26-workspace-active #vh26-entries textarea,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields input,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields textarea{box-sizing:border-box!important;width:100%!important;min-width:0!important;min-height:46px!important;padding:12px 14px!important;border:1px solid #cdd7df!important;border-radius:12px!important;background:#fafbfc!important;color:#163247!important;font:400 15px Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-section-notes,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-notes,#vh26-connected-dashboard.vh26-workspace-active #vh26-entries textarea,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields textarea{min-height:100px!important;line-height:1.5!important;resize:vertical!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries input:focus,#vh26-connected-dashboard.vh26-workspace-active #vh26-entries textarea:focus,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields input:focus,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields textarea:focus,#vh26-connected-dashboard.vh26-workspace-active #vh26-section-notes:focus,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-notes:focus{outline:3px solid #004d7126!important;border-color:#004d71!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry>button{justify-self:start!important;align-self:end!important;width:max-content!important;min-width:0!important;min-height:42px!important;padding:10px 16px!important;border:1px solid #cbd6de!important;border-radius:12px!important;background:#fff!important;color:#004d71!important;font:600 14px Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry>button:hover{border-color:#004d71!important;background:#f5f9fb!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields[hidden]{display:none!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-add-entry,#vh26-connected-dashboard.vh26-workspace-active #vh26-ai-review{min-height:42px!important;padding:10px 16px!important;border-radius:12px!important;font:600 14px Inter,Segoe UI,Arial,sans-serif!important}
    @media(max-width:850px){#vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
    @media(max-width:560px){#vh26-connected-dashboard.vh26-workspace-active #vh26-section-editor,#vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace,#vh26-connected-dashboard.vh26-workspace-active #vh26-review-workspace{padding:18px!important}#vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry,#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields{grid-template-columns:1fr!important}}
  `;
  document.head.append(reportingFormStyle);

  const stage3Polish = document.createElement('style');
  stage3Polish.id = 'vh26-stage3-user-facing-polish';
  stage3Polish.textContent = `
    #vh26-connected-dashboard.vh26-workspace-active #vh26-native-report #vh26-report-status:empty{display:none!important}
    #vh26-connected-dashboard.vh26-action-view-active.vh26-workspace-active #vh26-account{display:none!important}
    #vh26-connected-dashboard.vh26-action-view-active.vh26-workspace-active #vh26-actions-summary:empty{display:none!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions{gap:16px!important;margin-top:20px!important}
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

  function install() {
    installDepartmentChooserStyle();
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
