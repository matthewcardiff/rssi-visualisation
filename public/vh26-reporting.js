(function () {
  const reportingBridge = () => window.vh26AutosaveBridge || null;
  const reportContext = () => reportingBridge()?.context?.() || { editable: false };
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
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important;width:100%!important;margin-top:12px!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-pipeline-workspace .vh26-pipeline-actions button:nth-child(2){display:none!important}
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
    #vh26-connected-dashboard.vh26-workspace-active #vh26-report-workspace #vh26-report-intro,#vh26-connected-dashboard.vh26-workspace-active #vh26-report-workspace #vh26-native-report{box-sizing:border-box!important;width:100%!important;max-width:1066px!important;margin-left:auto!important;margin-right:auto!important}
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
    #vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields{box-sizing:border-box!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:12px!important;width:100%!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields[hidden]{display:none!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-add-entry,#vh26-connected-dashboard.vh26-workspace-active #vh26-ai-review{min-height:42px!important;padding:10px 16px!important;border-radius:12px!important;font:600 14px Inter,Segoe UI,Arial,sans-serif!important}
    #vh26-connected-dashboard.vh26-workspace-active.vh26-hsqe-report-active #vh26-ai-review{display:none!important}
    #vh26-connected-dashboard.vh26-workspace-active #vh26-section-editor:not([hidden]) #vh26-generic-section-editor:not([hidden]) #vh26-entries .vh26-entry,
    #vh26-connected-dashboard.vh26-workspace-active #vh26-section-editor:not([hidden]) #vh26-generic-section-editor:not([hidden]) #vh26-add-entry{display:none!important}
    @media(max-width:850px){#vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry{grid-template-columns:repeat(2,minmax(0,1fr))!important}#vh26-connected-dashboard.vh26-workspace-active #vh26-hsqe-fields{grid-template-columns:minmax(0,1fr)!important}#vh26-connected-dashboard.vh26-workspace-active #vh26-entries .vh26-entry{grid-template-areas:"title owner" "support required" "update update" "remove remove"!important}}
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
      const plainIntro = 'Only approved and published figures appear in reports. Each import below shows its current review and publication status.';
      if (intro.textContent !== plainIntro) intro.textContent = plainIntro;
    }
    const refresh = document.getElementById('vh26-finance-review-refresh');
    if (refresh && refresh.textContent !== 'Refresh list') refresh.textContent = 'Refresh list';

    const status = document.getElementById('vh26-finance-review-status');
    if (status?.textContent) {
      const count = status.textContent.match(/(\d+) imports? found/i)?.[1];
      if (count) {
        const plainStatus = `${count} finance import${count === '1' ? '' : 's'} in the register. Check each status below; published imports are marked.`;
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

  const delay = 650;
  let sectionTimer = 0;
  let sectionSaving = false;
  let sectionSaveQueued = false;
  let reportingDirty = false;
  let reportingBusy = false;
  let reportingEditVersion = 0;
  let appDirtyNeedsClearing = false;
  let navigationSavePending = false;
  let requestedNavigation = null;
  let navigationReplay = false;
  let lastSelectedWeek = '';
  const pendingOpportunityCards = new Set();
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
    let id = reportContext().report?.id;
    if (id) return id;
    if (!reportingBridge()?.canManage?.()) throw Error('A manager must create the first draft before contributors can edit it.');
    const created = await reportingBridge().createReport();
    const report = created.items?.[0];
    id = report?.id;
    if (!id) throw Error('Draft creation failed.');
    const data = reportingBridge()?.nativeData?.();
    if (data) {
      const index = data.reports.findIndex(item => item.id === id);
      if (index < 0) data.reports.push(report); else data.reports[index] = { ...data.reports[index], ...report };
    }
    return id;
  }

  async function saveSection() {
    if (!reportContext().editable || reportingBridge()?.selectedSection?.() === 'review' || reportingBridge()?.selectedDepartment?.()?.code === 'bids-rfqs') return;
    if (sectionSaving) {
      sectionSaveQueued = true;
      return;
    }
    const sectionKey = reportingBridge()?.selectedSection?.();
    const departmentCode = reportingBridge()?.selectedDepartment?.()?.code;
    const savedEditVersion = reportingEditVersion;
    sectionSaving = true;
    reportingBusy = true;
    status('Saving changes to Supabase…');
    try {
      const id = await reportId();
      const old = (reportingBridge()?.nativeData?.()?.sections || []).find(x => x.report_id === id && x.section_key === sectionKey)?.content || {};
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
      const payload = { report_id: id, section_key: sectionKey, content };
      const saved = await reportingBridge().saveSection(payload);
      const data = reportingBridge()?.nativeData?.();
      if (data) {
        const row = { ...(saved?.items?.[0] || saved?.item || {}), ...payload };
        const index = data.sections.findIndex(item => item.report_id === id && item.section_key === sectionKey);
        if (index < 0) data.sections.push(row); else data.sections[index] = { ...data.sections[index], ...row };
      }
      reportingDirty = reportingEditVersion !== savedEditVersion;
      if (reportingDirty) status('A newer change is still saving…');
      else status('Saved automatically to Supabase');
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
    if (!reportContext().editable) return;
    reportingEditVersion++;
    reportingDirty = true;
    status('Changes will save automatically…');
    clearTimeout(sectionTimer);
    sectionTimer = setTimeout(saveSection, delay);
  }

  function scheduleOpportunitySave(card) {
    const save = card.querySelector(':scope > button:first-of-type');
    if (!save || !reportContext().editable) return;
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

  function updateHsqeReviewControl() {
    const dashboard = document.getElementById('vh26-connected-dashboard');
    dashboard?.classList.toggle('vh26-hsqe-report-active', reportingBridge()?.selectedDepartment?.()?.code === 'hsqe');
  }

  function navigationIntent(target) {
    if (target.matches('#vh26-week')) return { kind: 'week', value: target.value };
    if (target.matches('.vh26-sidebar nav button[data-connected-nav]')) return { kind: 'sidebar', key: target.dataset.connectedNav };
    if (target.matches('#vh26-section-tabs button')) return { kind: 'tab', label: target.textContent.trim() };
    if (target.matches('.vh26-report-step-controls button')) return { kind: 'step', label: target.textContent.trim() };
    if (target.matches('#vh26-back-departments')) return { kind: 'back-departments' };
    return null;
  }

  function resolveNavigation(intent, root) {
    const dashboard = document.getElementById('vh26-connected-dashboard') || root;
    if (intent.kind === 'week') return dashboard.querySelector('#vh26-week');
    if (intent.kind === 'sidebar') return dashboard.querySelector(`.vh26-sidebar nav button[data-connected-nav="${CSS.escape(intent.key)}"]`);
    if (intent.kind === 'back-departments') return dashboard.querySelector('#vh26-back-departments');
    if (intent.kind === 'tab') return [...dashboard.querySelectorAll('#vh26-section-tabs button')].find(button => button.textContent.trim() === intent.label);
    return [...dashboard.querySelectorAll('.vh26-report-step-controls button')].find(button => button.textContent.trim() === intent.label && button.getClientRects().length);
  }

  async function waitForStatus(successPattern, failurePattern, beforeText) {
    const node = document.getElementById('vh26-report-status');
    if (!node) return false;
    const started = Date.now();
    while (Date.now() - started < 20000) {
      const message = node.textContent.trim();
      if (successPattern.test(message) && message !== beforeText) return true;
      if (failurePattern.test(message) && message !== beforeText) return false;
      await new Promise(resolve => setTimeout(resolve, 40));
    }
    return false;
  }

  async function saveCurrentSectionForNavigation(root) {
    const pipeline = root.querySelector('#vh26-pipeline-workspace');
    if (pipeline && !pipeline.hidden) {
      const notes = root.querySelector('#vh26-pipeline-notes');
      const notesValue = notes?.value || '';
      const pendingCards = [...pendingOpportunityCards].filter(card => card.isConnected);
      for (const card of pendingCards) clearTimeout(opportunityTimers.get(card));
      const pendingRows = pendingCards.map(card =>
        Object.fromEntries([...card.querySelectorAll('[data-pipeline-prop]')].map(field => [field.dataset.pipelineProp, field.value.trim()]))
      );
      for (const values of pendingRows) {
        const populated = Object.values(values).some(Boolean);
        if (!populated) continue;
        const complete = values.customer && values.project && values.owner_text && /^\d{4}-\d{2}-\d{2}$/.test(values.required_by) && Number.isFinite(Number(values.estimated_value)) && Number(values.estimated_value) >= 0;
        if (!complete) {
          status('Complete the pipeline opportunity or remove it before changing section.');
          return false;
        }
        const card = [...root.querySelectorAll('.vh26-pipeline-card')].find(candidate => {
          const fields = Object.fromEntries([...candidate.querySelectorAll('[data-pipeline-prop]')].map(field => [field.dataset.pipelineProp, field.value.trim()]));
          return fields.customer === values.customer && fields.project === values.project;
        });
        if (!card) continue;
        const save = card.querySelector(':scope > button:first-of-type');
        if (!save) return false;
        const messageNode = document.getElementById('vh26-pipeline-message');
        if (messageNode) messageNode.textContent = 'Saving opportunity…';
        save.click();
        const started = Date.now();
        let saved = false;
        while (Date.now() - started < 20000) {
          const message = document.getElementById('vh26-pipeline-message')?.textContent.trim() || '';
          if (/Opportunity saved to Supabase/i.test(message)) { saved = true; break; }
          if (/Pipeline unavailable|Save failed|Complete every field/i.test(card.textContent || '')) break;
          await new Promise(resolve => setTimeout(resolve, 40));
        }
        if (!saved) { status('The pipeline opportunity could not be saved. Stay here and retry.'); return false; }
      }
      pendingOpportunityCards.clear();
      const saveNotes = root.querySelector('#vh26-pipeline-save-notes');
      if (saveNotes && !saveNotes.disabled) {
        const id = await reportId();
        const payload = {
          report_id: id,
          section_key: 'pipeline',
          content: { notes: notesValue.trim(), entries: [] }
        };
        const saved = await reportingBridge().saveSection(payload);
        const data = reportingBridge()?.nativeData?.();
        if (data) {
          const row = { ...(saved?.items?.[0] || saved?.item || {}), ...payload };
          const index = data.sections.findIndex(item => item.report_id === id && item.section_key === 'pipeline');
          if (index < 0) data.sections.push(row); else data.sections[index] = { ...data.sections[index], ...row };
        }
        reportingDirty = false;
        reportingBridge().markSaved?.();
        status('Pipeline section saved');
      }
      appDirtyNeedsClearing = false;
      reportingDirty = false;
      return true;
    }

    if (!await flushSectionSave()) return false;
    if (!appDirtyNeedsClearing) return true;

    const saveDraft = root.querySelector('#vh26-save-section');
    if (!saveDraft || saveDraft.disabled) return false;
    const before = document.getElementById('vh26-report-status')?.textContent.trim() || '';
    saveDraft.click();
    if (!await waitForStatus(/^Draft saved to Supabase$/i, /Save failed:/i, before)) {
      status('The section could not be saved. Stay here and retry.');
      return false;
    }
    appDirtyNeedsClearing = false;
    reportingDirty = false;
    return true;
  }

  function runNavigation(intent, root) {
    requestedNavigation = intent;
    if (navigationSavePending) return;
    navigationSavePending = true;
    status('Saving this section before moving…');
    void saveCurrentSectionForNavigation(root).then(saved => {
      const nextIntent = requestedNavigation;
      requestedNavigation = null;
      if (!saved) return;
      const next = resolveNavigation(nextIntent, root);
      if (!next || !next.isConnected || next.disabled) {
        status('This section is not available yet. Complete the required earlier sections first.');
        return;
      }
      navigationReplay = true;
      if (nextIntent.kind === 'week') {
        next.value = nextIntent.value;
        next.dispatchEvent(new Event('change', { bubbles: true }));
        lastSelectedWeek = next.value;
      } else next.click();
    }).catch(error => {
      status('Could not save this section: ' + error.message);
    }).finally(() => {
      navigationReplay = false;
      navigationSavePending = false;
    });
  }

  function simplifyNarrativeEntries(root) {
    const sectionEditor = root.querySelector('#vh26-section-editor');
    const pipeline = root.querySelector('#vh26-pipeline-workspace');
    const generic = root.querySelector('#vh26-generic-section-editor');
    const hsqe = root.querySelector('#vh26-hsqe-fields');
    const notes = root.querySelector('#vh26-section-notes');
    const entries = root.querySelector('#vh26-entries');
    if (!sectionEditor || sectionEditor.hidden || !generic || generic.hidden || !hsqe?.hidden || !pipeline?.hidden || !notes || !entries) return;

    const cards = [...entries.querySelectorAll('.vh26-entry')];
    if (!cards.length) return;
    const legacyLines = cards.map(card => {
      const values = Object.fromEntries([...card.querySelectorAll('[data-prop]')].map(field => [field.dataset.prop, field.value.trim()]));
      const heading = values.title || values.update || 'Update';
      const details = [values.title && values.update && values.title !== values.update ? values.update : '', values.owner && `Owner: ${values.owner}`, values.support && `Support: ${values.support}`, values.required_by && `Required by: ${values.required_by}`].filter(Boolean);
      return details.length ? `${heading} — ${details.join(' · ')}` : heading;
    }).filter(Boolean);
    const existing = notes.value.trim();
    const additions = legacyLines.filter(line => !existing.includes(line));
    if (additions.length) {
      notes.value = [existing, ...additions].filter(Boolean).join('\n');
      notes.dispatchEvent(new Event('input', { bubbles: true }));
    }
    entries.replaceChildren();
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
      if (label?.firstChild?.nodeType === Node.TEXT_NODE && label.firstChild.textContent !== title) label.firstChild.textContent = title;
      if (field && placeholder && field.placeholder !== placeholder) field.placeholder = placeholder;
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

  const presenterApiCache = { token: null, identity: null, reports: null, sections: null, finance: new Map(), actions: new Map() };

  async function presenterApi(op, extra = {}) {
    const token = await window.vhGetAIReviewToken?.();
    if (!token) throw new Error('Sign in again to continue.');
    if (presenterApiCache.token !== token) {
      presenterApiCache.token = token;
      presenterApiCache.identity = null;
      presenterApiCache.reports = null;
      presenterApiCache.sections = null;
      presenterApiCache.finance.clear();
      presenterApiCache.actions.clear();
    }
    let response;
    try {
      response = await fetch('/api/acceptance', {
      method: 'POST', headers: { 'content-type': 'application/json' }, cache: 'no-store',
      body: JSON.stringify({ op, access_token: token, ...extra }), signal: AbortSignal.timeout(20000)
      });
    } catch (error) {
      if (error?.name === 'TimeoutError' || error?.name === 'AbortError') {
        if (op === 'finance_published') presenterApiCache.finance.clear();
        if (op === 'actions') presenterApiCache.actions.clear();
        throw new Error('Presenter request timed out. Use Refresh to try again.');
      }
      throw error;
    }
    let body;
    try { body = await response.json(); } catch { throw new Error('The presenter could not load meeting data.'); }
    if (!response.ok) throw new Error(body.error || 'The presenter could not load meeting data.');
    return body;
  }

  function cachedPresenterRequest(cache, key, create) {
    const isMap = cache instanceof Map;
    const existing = isMap ? cache.get(key) : cache[key];
    if (existing) return existing;
    const request = Promise.resolve().then(create);
    if (isMap) cache.set(key, request); else cache[key] = request;
    request.catch(() => {
      if (isMap) {
        if (cache.get(key) === request) cache.delete(key);
      } else if (cache[key] === request) cache[key] = null;
    });
    return request;
  }

  const presenterIdentity = () => cachedPresenterRequest(presenterApiCache, 'identity', () => presenterApi('whoami'));
  const presenterReports = () => cachedPresenterRequest(presenterApiCache, 'reports', () => presenterApi('reports'));
  const presenterSections = () => cachedPresenterRequest(presenterApiCache, 'sections', () => presenterApi('sections'));
  const presenterFinance = weekId => cachedPresenterRequest(presenterApiCache.finance, weekId, () => presenterApi('finance_published'));

  window.vhInvalidatePresenterFinanceCache = () => presenterApiCache.finance.clear();

  function presenterMoney(value) {
    if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value))) return 'Not reported';
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value));
  }

  function presenterVariance(revenue, budget) {
    if (budget === null || budget === undefined || budget === '' || revenue === null || revenue === undefined || revenue === '') return { text: 'Not reported', state: 'unavailable', label: 'Gap not reported' };
    const variance = Number(budget) - Number(revenue);
    if (!Number.isFinite(variance)) return { text: 'Not reported', state: 'unavailable', label: 'Gap not reported' };
    const favourable = variance <= 0;
    const amount = presenterMoney(Math.abs(variance));
    return { text: (variance < 0 ? '−' : '') + amount, state: favourable ? 'favourable' : 'adverse', label: amount + (favourable ? ' favourable gap' : ' gap to close') };
  }

  function presenterDepartmentContext(slide, tabs) {
    const departmentName = slide.querySelector(':scope > .vh26-presenter-heading h1')?.textContent.trim() || '';
    const selected = [...(tabs?.querySelectorAll('button') || [])].slice(1,-1).findIndex(button => button.classList.contains('selected'));
    const count = Math.max(1, [...(tabs?.querySelectorAll('button') || [])].length - 2);
    const weekLabel = document.getElementById('vh26-presenter-week')?.textContent.trim() || 'Reporting week not available';
    const weekId = document.getElementById('vh26-host-week-select')?.value || '';
    const activeCards = [...slide.querySelectorAll(':scope > .vh26-presenter-card:not(.vh26-presenter-finance-card):not(.vh26-presenter-actions-card)')];
    const populated = activeCards.filter(card => !card.querySelector('p.empty')).length;
    return { departmentName, departmentNumber: Math.max(0, selected) + 1, departmentCount: count, weekLabel, weekId, activeCards, populated };
  }

  function presenterDepartmentForName(identity, name) {
    const aliases = { 'Civils':'civils', 'S&T':'signalling', 'MMA':'midland-metro', 'TWS':'track-warning-systems' };
    const code = aliases[name] || String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return (identity.departments || []).find(d => d.code === code || d.display_name === name || d.name === name);
  }

  function presenterAppendOverview(slide, heading, context) {
    const signature = JSON.stringify([context.departmentName, context.weekId, context.populated]);
    if (heading.dataset.overviewSignature === signature && heading.querySelector('.vh26-presenter-heading-meta') && heading.querySelector('.vh26-presenter-overview')) return;
    const meta = presenterTextElement('p', 'DEPARTMENT ' + context.departmentNumber + ' OF ' + context.departmentCount + ' · ' + context.populated + '/6 sections populated');
    meta.className = 'vh26-presenter-heading-meta';
    let status = 'Report status unavailable';
    heading.dataset.overviewSignature = signature;
    heading.querySelector('.vh26-presenter-heading-meta')?.remove();
    heading.querySelector('.vh26-presenter-overview')?.remove();
    heading.prepend(meta);
    const overview = presenterTextElement('p', 'Weekly department update · ' + context.weekLabel);
    overview.className = 'vh26-presenter-overview';
    heading.append(overview);
    void (async () => {
      try {
        const reportsRequest = presenterReports();
        const [identity, reports] = await Promise.all([
          presenterIdentity(),
          reportsRequest
        ]);
        if (!heading.isConnected || heading.dataset.overviewSignature !== signature) return;
        const department = presenterDepartmentForName(identity, context.departmentName);
        const report = (reports.items || []).find(r => r.department_id === department?.id && r.reporting_week_id === context.weekId);
        const state = String(report?.status || 'unsubmitted').toLowerCase();
        status = state === 'reopened' ? 'Report Reopened' : 'Report ' + (state.charAt(0).toUpperCase() + state.slice(1));
        meta.textContent = 'DEPARTMENT ' + context.departmentNumber + ' OF ' + context.departmentCount + ' · ' + context.populated + '/6 sections populated · ' + status;
      } catch { /* Keep the meeting week and section summary visible if status lookup is unavailable. */ }
    })();
  }

  function presenterFinanceCard(slide, context) {
    let panel = slide.querySelector(':scope > .vh26-presenter-finance-card');
    if (!panel) {
      panel = document.createElement('section');
      panel.className = 'vh26-presenter-card vh26-presenter-finance-card';
      panel.setAttribute('aria-label', 'Department financial overview');
      slide.append(panel);
    }
    const signature = JSON.stringify([context.departmentName, context.weekId]);
    if (panel.dataset.signature === signature) return panel;
    panel.dataset.signature = signature;
    panel.replaceChildren();
    panel.append(presenterTextElement('div', 'REVENUE'));
    panel.querySelector('div').className = 'vh26-presenter-revenue-title';
    panel.querySelector('div').textContent = 'DEPARTMENT FINANCIAL OVERVIEW';
    const data = presenterTextElement('p', 'Loading figures…');
    data.className = 'vh26-presenter-revenue-status';
    panel.append(data);
    void (async () => {
      try {
        const identity = await presenterIdentity();
        const department = presenterDepartmentForName(identity, context.departmentName);
        if (!department || !context.weekId) throw new Error('Finance figures are unavailable.');
        const cacheKey = context.weekId;
        const finance = await presenterFinance(cacheKey);
        const publications = (finance.publications || []).filter(p => p.reporting_week_id === context.weekId).sort((a,b) => Number(b.publication_version || 0) - Number(a.publication_version || 0));
        const publication = publications.find(p => p.department_id === department.id);
        if (!publication) { data.textContent = 'No published finance figures are available for this department and week. Figures appear after finance review and publication.'; return; }
        const values = (finance.values || []).filter(v => v.publication_id === publication.id);
        const reportPeriod = (finance.periods || []).find(p => p.start_date === context.weekLabel.match(/\b\d{4}-\d{2}-\d{2}/)?.[0]);
        const get = key => { const item = values.find(v => v.metric_key === key && v.source_period_id === reportPeriod?.id); return item?.input_state === 'missing' ? null : item?.amount ?? null; };
        const weeklyBudget = get('weekly_budget'), weeklyRevenue = get('weekly_revenue');
        const ytdBudget = get('ytd_budget'), ytdRevenue = get('ytd_revenue');
        const metrics = [
          ['Weekly budget', presenterMoney(weeklyBudget)], ['Weekly revenue', presenterMoney(weeklyRevenue)],
          ['Weekly gap to close', presenterVariance(weeklyRevenue, weeklyBudget)],
          ['YTD budget', presenterMoney(ytdBudget)], ['YTD revenue', presenterMoney(ytdRevenue)],
          ['YTD gap to close', presenterVariance(ytdRevenue, ytdBudget)]
        ];
        const grid = document.createElement('div');
        grid.className = 'vh26-presenter-revenue-grid';
        for (const [label, amount] of metrics) {
          const item = document.createElement('div'); item.className = 'vh26-presenter-revenue-item';
          item.append(presenterTextElement('strong', label));
          const value = presenterTextElement('span', typeof amount === 'string' ? amount : amount.text);
          if (typeof amount !== 'string') { value.classList.add('vh26-presenter-variance-' + amount.state); value.setAttribute('aria-label', amount.label); }
          item.append(value);
          grid.append(item);
        }
        if (!panel.isConnected || panel.dataset.signature !== signature) return;
        const foot = presenterTextElement('p', 'Figures from the Finance upload · ' + context.weekLabel);
        foot.className = 'vh26-presenter-finance-source';
        const sourceId = values.find(v => v.source_period_id)?.source_period_id;
        const source = (finance.periods || []).find(p => p.id === sourceId);
        if (source && source.id !== reportPeriod?.id) foot.textContent = 'Published figures do not match this reporting week. Figures are withheld.';
        else if (reportPeriod) foot.textContent = 'Finance period NRW WK' + reportPeriod.rail_week + ' · ' + reportPeriod.start_date + '–' + reportPeriod.end_date;
        panel.replaceChildren(panel.querySelector('.vh26-presenter-revenue-title'), grid, foot);
      } catch (error) {
        if (panel.isConnected && panel.dataset.signature === signature) data.textContent = error?.message ? 'Finance figures could not load: ' + error.message : 'Finance figures are not available for this week.';
      }
    })();
    return panel;
  }

  function installSafetyMomentDiagnostics() {
    if (window.__vhSafetyMomentDiagnosticsInstalled || typeof window.fetch !== 'function') return;
    window.__vhSafetyMomentDiagnosticsInstalled = true;
    const originalFetch = window.fetch.bind(window);
    window.fetch = async function (input, init) {
      const url = typeof input === 'string' ? input : input?.url || '';
      const isSafetyMoment = String(url).includes('/.netlify/functions/safety-moment');
      const response = await originalFetch(input, init);
      if (!isSafetyMoment) return response;
      const contentType = response.headers.get('content-type') || 'unknown content type';
      let payload = null;
      try { payload = await response.clone().json(); } catch { /* Report the HTTP and content type below. */ }
      const hasError = typeof payload?.error === 'string' && payload.error.trim();
      const validResult = payload && typeof payload === 'object' && !Array.isArray(payload)
        && typeof payload.topic === 'string' && typeof payload.why === 'string'
        && typeof payload.scenario === 'string' && typeof payload.takeaway === 'string'
        && Array.isArray(payload.points) && payload.points.length === 3
        && Array.isArray(payload.questions) && payload.questions.length === 2;
      if (!response.ok && hasError) return response;
      if (response.ok && validResult) return response;
      const message = !response.ok
        ? 'Safety Moment function returned HTTP ' + response.status + ' (' + contentType + '). Check the branch deployment and Netlify function logs.'
        : 'Safety Moment function returned an invalid response (HTTP ' + response.status + ', ' + contentType + '). Check the branch deployment and Netlify function logs.';
      return new Response(JSON.stringify({ error: message }), {
        status: response.ok ? 502 : response.status,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
      });
    };
  }

  function presenterActionsCard(slide, context) {
    let panel = slide.querySelector(':scope > .vh26-presenter-actions-card');
    if (!panel) { panel = document.createElement('section'); panel.className = 'vh26-presenter-card vh26-presenter-actions-card'; slide.append(panel); }
    const signature = JSON.stringify([context.departmentName, context.weekId]);
    if (panel.dataset.signature === signature) return panel;
    panel.dataset.signature = signature;
    const header = document.createElement('div'); header.className = 'vh26-presenter-actions-head';
    header.append(presenterTextElement('h2', 'Outstanding actions'));
    panel.replaceChildren(header);
    const intro = presenterTextElement('p', 'Review and update actions during the meeting. Changes are saved to the department action register.');
    intro.className = 'vh26-presenter-actions-intro'; panel.append(intro);
    const status = presenterTextElement('p', 'Loading actions…'); status.className = 'vh26-presenter-actions-status'; status.setAttribute('role','status'); panel.append(status);
    void loadPresenterActions(panel, context, signature);
    return panel;
  }

  async function loadPresenterActions(panel, context, signature, notice = '') {
    try {
      const [identity, result] = await Promise.all([
        presenterIdentity(),
        presenterApi('actions')
      ]);
      if (!panel.isConnected || panel.dataset.signature !== signature) return;
      const dept = presenterDepartmentForName(identity, context.departmentName);
      const canEdit = (identity.roles || []).some(role => ['administrator','meeting_host','executive'].includes(role.role));
      const actions = (result.items || []).filter(a => a.department_id === dept?.id && !['completed','cancelled'].includes(a.status));
      const head = panel.querySelector('h2');
      if (head) head.textContent = 'Outstanding actions (' + actions.length + ')';
      const actionStatus = panel.querySelector('.vh26-presenter-actions-status');
      if (actionStatus) actionStatus.textContent = notice;
      const table = document.createElement('table'); table.className = 'vh26-presenter-action-table';
      const thead = document.createElement('thead'), hr = document.createElement('tr');
      for (const label of ['Action / decision','Owner','Target date','Status','Controls']) hr.append(presenterTextElement('th',label));
      thead.append(hr); table.append(thead);
      const tbody = document.createElement('tbody'); table.append(tbody);
      for (const action of actions) {
        const tr = document.createElement('tr');
        const description = document.createElement('td'); const owner = document.createElement('td'); const target = document.createElement('td'); const state = document.createElement('td'); const controls = document.createElement('td');
        const descriptionField = document.createElement('input'); descriptionField.value = action.description || ''; descriptionField.setAttribute('aria-label','Action or decision'); descriptionField.readOnly = !canEdit; descriptionField.spellcheck = true; descriptionField.lang='en-GB';
        const ownerField = document.createElement('input'); ownerField.value = action.owner_text || ''; ownerField.setAttribute('aria-label','Owner'); ownerField.readOnly = !canEdit; ownerField.spellcheck = true; ownerField.lang='en-GB';
        const dateField = document.createElement('input'); dateField.type='date'; dateField.value = action.required_by || ''; dateField.setAttribute('aria-label','Target date'); dateField.disabled = !canEdit;
        const stateSelect = document.createElement('select'); stateSelect.setAttribute('aria-label','Status'); for (const value of ['open','in_progress','completed','cancelled']) {const option=document.createElement('option');option.value=value;option.textContent=value.replace('_',' ');stateSelect.append(option)} stateSelect.value=action.status || 'open'; stateSelect.disabled=!canEdit;
        description.append(descriptionField); owner.append(ownerField); target.append(dateField); state.append(stateSelect);
        const save = async () => {
          if (!canEdit) return;
          const token = await window.vhGetAIReviewToken?.();
          if (!token) {status.textContent='Sign in again to save actions.';return}
          const saveState = presenterTextElement('span','Saving…'); controls.replaceChildren(saveState);
          try {
            await presenterApi('update_action',{id:action.id,department_id:action.department_id,version:action.version,status:stateSelect.value,description:descriptionField.value.trim(),owner_text:ownerField.value.trim(),support_text:action.support_text||'',required_by:dateField.value});
            await loadPresenterActions(panel,context,signature,'Action saved.');
          } catch (error) { controls.replaceChildren(presenterTextElement('span','Could not save. Try again.')); }
        };
        for (const field of [descriptionField,ownerField,dateField,stateSelect]) field.addEventListener('change',save);
        if (canEdit) { const remove=document.createElement('button');remove.type='button';remove.className='outline vh26-presenter-delete-action';remove.textContent='Delete';remove.addEventListener('click',async()=>{if(!confirm('Remove this action from the outstanding list? It will remain in action history.'))return;stateSelect.value='cancelled';await save()});controls.append(remove)}
        else controls.textContent='—';
        tr.append(description,owner,target,state,controls); tbody.append(tr);
      }
      if (!actions.length) {const row=document.createElement('tr'),cell=presenterTextElement('td','No outstanding actions for this department.');cell.colSpan=5;row.append(cell);tbody.append(row)}
      const existing = panel.querySelector('.vh26-presenter-action-table'); existing?.replaceWith(table);
      if (!existing) panel.append(table);
      let createForm = panel.querySelector('.vh26-presenter-create-action');
      if (canEdit && !createForm) {
        const create=document.createElement('button');create.type='button';create.className='orange vh26-presenter-create-action-toggle';create.textContent='+ Create action';
        create.addEventListener('click',()=>{const form=panel.querySelector('.vh26-presenter-create-action');form.hidden=!form.hidden});
        const form=document.createElement('form');form.className='vh26-presenter-create-action';form.hidden=true;
        const desc=document.createElement('textarea');desc.name='description';desc.required=true;desc.maxLength=3000;desc.placeholder='Action or decision';desc.setAttribute('aria-label','Action or decision');desc.spellcheck=true;desc.lang='en-GB';
        const person=document.createElement('input');person.name='owner_text';person.required=true;person.maxLength=200;person.placeholder='Owner';person.setAttribute('aria-label','Owner');person.spellcheck=true;person.lang='en-GB';
        const due=document.createElement('input');due.name='required_by';due.type='date';due.required=true;due.setAttribute('aria-label','Target date');
        const submit=document.createElement('button');submit.type='submit';submit.className='orange';submit.textContent='Save action';
        form.append(desc,person,due,submit);
        form.addEventListener('submit',async event=>{event.preventDefault();submit.disabled=true;try{const dept=presenterDepartmentForName(identity, context.departmentName);if(!dept||!context.weekId)throw new Error('Department or reporting week is unavailable.');await presenterApi('create_action',{department_id:dept.id,reporting_week_id:context.weekId,description:desc.value.trim(),owner_text:person.value.trim(),support_text:'',required_by:due.value});form.reset();form.hidden=true;await loadPresenterActions(panel,context,signature,'Action saved.')}catch{status.textContent='The action could not be saved. Check the required fields and try again.'}finally{submit.disabled=false}});
        const actionsHead = panel.querySelector('.vh26-presenter-actions-head');
        if (actionsHead) actionsHead.append(create);
        panel.insertBefore(form,panel.querySelector('.vh26-presenter-action-table'));
      }
    } catch (error) {
      if (panel.isConnected && panel.dataset.signature === signature) {const status=panel.querySelector('.vh26-presenter-actions-status');if(status)status.textContent=error?.message ? 'Actions could not load: ' + error.message : 'Actions are unavailable. Refresh Presenter Mode and try again.'}
    }
  }


  const presenterHsqeCategories = [
    { key:'hsqe_accidents', title:'Accidents and Incidents', fields:[['accidents','Accidents'],['incidents','Incidents'],['details','Details, actions and current status']] },
    { key:'hsqe_close_calls', title:'Close Calls by Department', fields:[['department_breakdown','Department breakdown'],['total_12_months','Close calls in the last 12 months'],['notes','Trends and follow-up']] },
    { key:'hsqe_assurance', title:'Assurance, Performance and Sustainability', fields:[['toolbox_talks','Toolbox talks'],['audits','Audits'],['ncrs','Non-conformance reports'],['supplier_performance','Supplier performance'],['site_inspections','Site inspections'],['campaigns','Themed weeks and campaigns'],['sustainability','Sustainability']] },
    { key:'hsqe_events', title:'Attendance at Events', fields:[['events','Events']] },
    { key:'hsqe_documents', title:'Documents', fields:[['documents','Documents']] }
  ];

  function renderPresenterHsqe(slide, context) {
    slide.querySelector(':scope > .vh26-presenter-finance-card')?.remove();
    slide.querySelector(':scope > .vh26-presenter-bid-link-card')?.remove();
    for (const card of [...slide.querySelectorAll(':scope > .vh26-presenter-card:not(.vh26-presenter-actions-card):not(.vh26-presenter-hsqe-card)')]) card.remove();
    const signature = JSON.stringify([context.weekId, context.departmentName]);
    const cards = presenterHsqeCategories.map(category => {
      let card = slide.querySelector(':scope > .vh26-presenter-hsqe-card[data-category="' + category.key + '"]');
      if (!card) {
        card = document.createElement('section');
        card.className = 'vh26-presenter-card vh26-presenter-hsqe-card';
        card.dataset.category = category.key;
        card.append(presenterTextElement('h2', category.title));
        slide.append(card);
      }
      if (card.dataset.signature !== signature) {
        card.dataset.signature = signature;
        card.replaceChildren(presenterTextElement('h2', category.title), presenterTextElement('p', 'Loading HSQE report…'));
      }
      return { category, card };
    });
    if (cards.every(({card}) => card.dataset.loadedSignature === signature || card.dataset.loadingSignature === signature)) return;
    for (const {card} of cards) card.dataset.loadingSignature = signature;
    void (async () => {
      try {
        const [identity, reports, sections] = await Promise.all([presenterIdentity(), presenterReports(), presenterSections()]);
        const department = presenterDepartmentForName(identity, context.departmentName);
        const report = (reports.items || []).find(item => item.department_id === department?.id && item.reporting_week_id === context.weekId);
        for (const {category, card} of cards) {
          if (!card.isConnected || card.dataset.signature !== signature) return;
          const section = (sections.items || []).find(item => item.report_id === report?.id && item.section_key === category.key);
          const content = section?.content || {};
          const fields = content.fields || {};
          const hasValues = category.fields.some(([key]) => fields[key] !== null && fields[key] !== undefined && String(fields[key]).trim() !== '');
          const children = [presenterTextElement('h2', category.title)];
          if (content.demo) {
            const badge = presenterTextElement('p', content.demo);
            badge.className = 'vh26-presenter-demo-tag';
            children.push(badge);
          }
          if (hasValues) {
            for (const [key, label] of category.fields) {
              const value = fields[key];
              if (value === null || value === undefined || String(value).trim() === '') continue;
              const row = document.createElement('p');
              row.append(presenterTextElement('strong', label + ': '), document.createTextNode(String(value)));
              children.push(row);
            }
          } else {
            const empty = presenterTextElement('p', 'Not reported for this week.');
            empty.className = 'empty';
            children.push(empty);
          }
          card.replaceChildren(...children);
          card.dataset.loadedSignature = signature;
          card.dataset.loadingSignature = '';
        }
      } catch {
        for (const {category, card} of cards) {
          if (!card.isConnected || card.dataset.signature !== signature) continue;
          card.replaceChildren(presenterTextElement('h2', category.title), Object.assign(presenterTextElement('p','HSQE report could not load.'),{className:'empty'}));
          card.dataset.loadedSignature = signature;
          card.dataset.loadingSignature = '';
        }
      }
    })();
  }

  function renderPresenterBidHub(slide, context) {
    slide.querySelector(':scope > .vh26-presenter-finance-card')?.remove();
    slide.querySelectorAll(':scope > .vh26-presenter-hsqe-card').forEach(card => card.remove());
    for (const card of [...slide.querySelectorAll(':scope > .vh26-presenter-card:not(.vh26-presenter-actions-card):not(.vh26-presenter-bid-link-card)')]) card.remove();
    let card = slide.querySelector(':scope > .vh26-presenter-bid-link-card');
    if (!card) {
      card = document.createElement('section');
      card.className = 'vh26-presenter-card vh26-presenter-bid-link-card';
      card.setAttribute('aria-label','Bid Hub');
      const heading = presenterTextElement('h2','Bid Hub');
      const description = presenterTextElement('p','Open the Bid Hub bid tracker to review current bids and RFQs.');
      const link = document.createElement('a');
      link.href = 'https://rssi-bid-hub-staging2.netlify.app/#/tracker';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'orange';
      link.textContent = 'Open Bid Hub';
      card.append(heading,description,link);
      slide.append(card);
    }
  }

  function filterPresenterFinanceRows(slide) {
    const apply = () => {
      const excluded = new Set(['HSQE','Bids/RFQs']);
      for (const row of [...slide.querySelectorAll('table tr')]) {
        const label = row.cells?.[0]?.textContent.trim();
        if (label === 'Department') continue;
        if (excluded.has(label)) row.remove();
      }
      for (const summary of [...slide.querySelectorAll('small')]) {
        const text = summary.textContent || '';
        const match = text.match(/(\d+)\s+of\s+\d+\s+departments reported/i);
        if (!match) continue;
        const reported = Number(match[1]);
        summary.textContent = reported < 10
          ? 'Partial total · ' + reported + ' of 10 finance departments reported'
          : '10 of 10 finance departments reported';
      }
      for (const caption of [...slide.querySelectorAll('p')]) {
        if ((caption.textContent || '').trim().startsWith('Finance period:')) caption.classList.add('vh26-presenter-finance-source-caption');
      }
    };
    apply();
    if (slide.dataset.vh26FinanceRowsObserver !== 'true') {
      slide.dataset.vh26FinanceRowsObserver = 'true';
      const observer = new MutationObserver(apply);
      observer.observe(slide, { childList:true, subtree:true });
    }
  }

  function enhanceFinanceCompanyOverview(slide) {
    const overview = slide.querySelector('.vh26-presenter-company-overview');
    const table = [...slide.querySelectorAll('.vh26-presenter-finance-table')].find(candidate => {
      const headers = [...candidate.querySelectorAll('tr:first-child th')].map(cell => cell.textContent.trim());
      return headers.includes('Weekly budget') && headers.includes('YTD revenue') && headers.includes('YTD gap to close');
    });
    if (!overview || !table) return;
    const number = value => {
      if (!value || /not reported/i.test(value)) return null;
      const parsed = Number(String(value).replace(/[^0-9.-]/g, ''));
      return Number.isFinite(parsed) ? parsed : null;
    };
    const metric = label => {
      const card = [...overview.querySelectorAll('article')].find(item => item.querySelector('span')?.textContent.trim() === label);
      return { card, value: number(card?.querySelector('strong')?.textContent || '') };
    };
    const ytdBudget = metric('YTD budget'), ytdRevenue = metric('YTD revenue');
    let percentCard = [...overview.querySelectorAll('article')].find(item => item.querySelector('span')?.textContent.trim() === 'YTD variance %');
    if (!percentCard) {
      percentCard = document.createElement('article');
      percentCard.append(presenterTextElement('span', 'YTD variance %'), presenterTextElement('strong', 'Not reported'));
      overview.append(percentCard);
    }
    const percentValue = ytdBudget.value !== null && ytdRevenue.value !== null && ytdBudget.value !== 0
      ? (ytdRevenue.value - ytdBudget.value) / Math.abs(ytdBudget.value) * 100 : null;
    const percentText = percentValue === null ? 'Not reported' : (percentValue >= 0 ? '↑ ' : '↓ ') + Math.abs(percentValue).toLocaleString('en-GB', { maximumFractionDigits: 1 }) + '%';
    const percentOutput = percentCard.querySelector('strong');
    if (percentOutput && percentOutput.textContent !== percentText) percentOutput.textContent = percentText;
    if (percentOutput) percentOutput.className = percentValue === null ? 'vh26-finance-variance-unavailable' : 'vh26-finance-variance-' + (percentValue >= 0 ? 'favourable' : 'adverse');
    const ytdCoverage = ytdBudget.card?.querySelector('small');
    if (ytdCoverage && !percentCard.querySelector('small')) percentCard.append(ytdCoverage.cloneNode(true));
    const rows = [...table.querySelectorAll('tr')];
    const bodyRows = rows.slice(1).filter(row => !row.dataset.vh26LegacyHs2);
    const splitHs2 = bodyRows.filter(row => /hs2\s*(fencing|bird)/i.test(row.querySelector('th')?.textContent || ''));
    const splitHs2Unreported = splitHs2.length >= 2 && splitHs2.every(row => [...row.querySelectorAll('td')].slice(0, 6).every(cell => /not reported/i.test(cell.textContent || '')));
    let legacyRow = table.querySelector('tr[data-vh26-legacy-hs2="true"]');
    if (!splitHs2Unreported) { legacyRow?.remove(); return; }
    const aggregate = [null, metric('Weekly budget').value, metric('Weekly revenue').value, null, ytdBudget.value, ytdRevenue.value];
    const columns = [1, 2, 4, 5];
    for (const index of columns) {
      const available = bodyRows.map(row => number(row.querySelectorAll('td')[index - 1]?.textContent || '')).filter(value => value !== null);
      aggregate[index] = aggregate[index] === null ? null : aggregate[index] - available.reduce((sum, value) => sum + value, 0);
      if (aggregate[index] !== null && Math.abs(aggregate[index]) < 0.005) aggregate[index] = 0;
    }
    if (!columns.some(index => aggregate[index] !== null && aggregate[index] !== 0)) { legacyRow?.remove(); return; }
    if (!legacyRow) { legacyRow = document.createElement('tr'); legacyRow.dataset.vh26LegacyHs2 = 'true'; table.append(legacyRow); }
    const cell = index => presenterTextElement('td', aggregate[index] === null ? 'Not reported' : presenterMoney(aggregate[index]));
    const variance = (revenueIndex, budgetIndex) => {
      const revenue = aggregate[revenueIndex], budget = aggregate[budgetIndex];
      if (revenue === null || budget === null) { const output = presenterTextElement('td', 'Not reported'); output.className = 'vh26-finance-variance-unavailable'; return output; }
      const delta = revenue - budget, favourable = delta >= 0, output = presenterTextElement('td', (favourable ? '↑ ' : '↓ ') + presenterMoney(Math.abs(delta)));
      output.className = 'vh26-finance-variance-' + (favourable ? 'favourable' : 'adverse');
      output.setAttribute('aria-label', presenterMoney(Math.abs(delta)) + (favourable ? ' above budget' : ' below budget'));
      return output;
    };
    const children = [presenterTextElement('th', 'Historical HS2 (legacy)'), cell(1), cell(2), variance(2, 1), cell(4), cell(5), variance(5, 4)];
    const unchanged = legacyRow.childElementCount === children.length && children.every((child, index) => {
      const current = legacyRow.children[index];
      return current.tagName === child.tagName && current.textContent === child.textContent && current.className === child.className && current.getAttribute('aria-label') === child.getAttribute('aria-label');
    });
    if (!unchanged) legacyRow.replaceChildren(...children);
  }
  function enhancePresenterSlide() {
    const mode = document.getElementById('vh26-presenter-mode');
    const slide = document.getElementById('vh26-presenter-slide');
    if (!mode || mode.hidden || !slide) return;

    const tabs = mode.querySelector('#vh26-presenter-tabs');
    const activeTab = tabs?.querySelector('button.selected')?.textContent.trim() || '';
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

    const slideTitle = (title?.textContent || heading?.querySelector('h1')?.textContent || '').trim();
    const viewKind = slideTitle === 'Meeting readiness' ? 'all' : activeTab === 'Safety Moment' ? 'safety' : activeTab === 'Finance & Commercial' ? 'finance' : 'department';
    slide.classList.toggle('vh26-presenter-finance-active', viewKind === 'finance');
    const viewKey = JSON.stringify([viewKind, activeTab, slideTitle]);
    if (slide.dataset.vh26ScrollKey !== viewKey) {
      slide.dataset.vh26ScrollKey = viewKey;
      const resetPresenterScroll = () => {
        if (!slide.isConnected) return;
        slide.scrollTop = 0;
        slide.scrollLeft = 0;
        slide.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        mode.scrollTop = 0;
        mode.scrollLeft = 0;
        mode.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
        if (document.body) document.body.scrollTop = 0;
      };
      requestAnimationFrame(() => {
        resetPresenterScroll();
        requestAnimationFrame(resetPresenterScroll);
        setTimeout(resetPresenterScroll, 100);
      });
    }
    const weekSelect = document.getElementById('vh26-host-week-select');
    let preferredWeek = '';
    try { preferredWeek = sessionStorage.getItem('vh26-presenter-week-preference') || ''; } catch {}
    if (preferredWeek && weekSelect && weekSelect.value !== preferredWeek && [...weekSelect.options].some(option => option.value === preferredWeek)) {
      const restoreFor = preferredWeek;
      if (mode.dataset.vh26WeekRestoreFor !== restoreFor) {
        mode.dataset.vh26WeekRestoreFor = restoreFor;
        mode.dataset.vh26WeekRestoreAttempts = '0';
      }
      const attempts = Number(mode.dataset.vh26WeekRestoreAttempts || '0');
      if (attempts < 20) {
        mode.dataset.vh26WeekRestoreAttempts = String(attempts + 1);
        weekSelect.value = restoreFor;
        weekSelect.dispatchEvent(new Event('input', { bubbles: true }));
        weekSelect.dispatchEvent(new Event('change', { bubbles: true }));
        if (mode.dataset.vh26WeekRestoreTimer !== restoreFor) {
          mode.dataset.vh26WeekRestoreTimer = restoreFor;
          setTimeout(() => {
            mode.dataset.vh26WeekRestoreTimer = '';
            if (mode.isConnected && !mode.hidden) enhancePresenterSlide();
          }, 100);
        }
      }
    }
    mode.querySelector('#vh26-presenter-all')?.classList.toggle('selected', viewKind === 'all');

    if (viewKind === 'all') {
      heading?.querySelector('.vh26-presenter-heading-meta')?.remove();
      slide.querySelector(':scope > .vh26-presenter-kpis')?.remove();
      slide.querySelector(':scope > .vh26-presenter-actions-card')?.remove();
      slide.querySelector(':scope > .vh26-presenter-finance-card')?.remove();
    }

    if (heading && viewKind === 'department') {
      const departmentTabs = [...(tabs?.querySelectorAll('button') || [])].slice(2);
      const departmentIndex = departmentTabs.findIndex(button => button.classList.contains('selected'));
      const departmentName = activeTab || title?.textContent || 'Department';
      const week = document.getElementById('vh26-presenter-week')?.textContent.trim() || 'Reporting week not available';
      const cards = [...slide.querySelectorAll(':scope > .vh26-presenter-card:not(.vh26-presenter-actions-card)')];
      const context = presenterDepartmentContext(slide, tabs);
      presenterAppendOverview(slide, heading, context);
      slide.querySelector(':scope > .vh26-presenter-kpis')?.remove();
      const nonFinanceDepartment = ['HSQE', 'Bids/RFQs'].includes(departmentName);
      const revenue = nonFinanceDepartment ? null : presenterFinanceCard(slide, context);
      const actions = presenterActionsCard(slide, context);
      if (departmentName === 'HSQE') renderPresenterHsqe(slide, context);
      else if (departmentName === 'Bids/RFQs') renderPresenterBidHub(slide, context);
      const reportCards = [...slide.querySelectorAll(':scope > .vh26-presenter-card:not(.vh26-presenter-finance-card):not(.vh26-presenter-actions-card)')];
      const desired = [heading, ...(revenue ? [revenue] : []), actions, ...reportCards];
      if (desired.some((node, index) => slide.children[index] !== node)) {
        let anchor = heading;
        if (revenue) { anchor.after(revenue); anchor = revenue; }
        anchor.after(actions); anchor = actions;
        for (const card of reportCards) { anchor.after(card); anchor = card; }
      }
    }

    if (viewKind === 'finance') {
      filterPresenterFinanceRows(slide);
      let panel = slide.querySelector(':scope > .vh26-presenter-finance-panel');
      if (!panel) {
        panel = document.createElement('section');
        panel.className = 'vh26-presenter-card vh26-presenter-finance-panel';
        slide.append(panel);
      }
      for (const child of [...slide.children]) if (child !== heading && child !== panel && child.parentElement !== panel) panel.append(child);
      enhanceFinanceCompanyOverview(slide);
    } else if (viewKind === 'safety') {
      const content = slide.querySelector(':scope > .vh26-presenter-safety-content');
      let panel = slide.querySelector(':scope > .vh26-presenter-safety-panel');
      if (!panel) {
        panel = document.createElement('section');
        panel.className = 'vh26-presenter-safety-panel';
        slide.append(panel);
      }
      for (const child of [...slide.children]) if (child !== heading && child !== content && child !== panel && child.parentElement !== panel) panel.append(child);
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
        #vh26-presenter-mode .vh26-presenter-pager{position:fixed!important;left:0!important;right:0!important;bottom:0!important;z-index:501!important;box-sizing:border-box!important;display:flex!important;justify-content:space-between!important;align-items:center!important;gap:12px!important;width:100%!important;max-width:none!important;margin:0!important;padding:12px clamp(18px,3vw,48px) calc(12px + env(safe-area-inset-bottom))!important;transform:none!important;background:#f5f6f8!important;border-top:1px solid #dce5eb!important;box-shadow:0 -5px 16px #1230440d!important}
        #vh26-presenter-mode .vh26-presenter-pager button{min-height:42px!important;padding:10px 16px!important;border:1px solid #d7e2e9!important;border-radius:10px!important;background:#fff!important;color:#004d71!important;font-size:14px!important}
        #vh26-presenter-mode #vh26-presenter-slide{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:15px!important;width:calc(100% - 44px)!important;max-width:780px!important;margin:4px auto 0!important;padding:12px 0 calc(108px + env(safe-area-inset-bottom))!important;overflow-y:auto!important;overflow-x:hidden!important;background:transparent!important}
        #vh26-presenter-mode #vh26-presenter-slide>h1,#vh26-presenter-mode .vh26-presenter-heading{box-sizing:border-box!important;width:100%!important;margin:0!important;padding:22px 28px!important;border:1px solid #dce5eb!important;border-radius:18px!important;background:#fff!important;box-shadow:0 8px 30px #12304408!important}
        #vh26-presenter-mode .vh26-presenter-heading h1{margin:0!important;color:#003e5b!important;font-size:clamp(27px,2.8vw,38px)!important;font-weight:650!important;letter-spacing:-.035em!important;line-height:1.2!important}
        #vh26-presenter-mode .vh26-presenter-heading p{margin:8px 0 0!important;color:#597182!important;font-size:14px!important;line-height:1.5!important}
        #vh26-presenter-mode .vh26-presenter-heading-meta{margin:0 0 8px!important;color:#587080!important;font-size:11px!important;font-weight:700!important;letter-spacing:.09em!important}
        #vh26-presenter-mode .vh26-presenter-kpis,#vh26-presenter-mode .vh26-presenter-stat{display:none!important}
        #vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card,#vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-safety-panel{box-sizing:border-box!important;width:100%!important;margin:0!important;padding:22px 26px!important;border:1px solid #dce5eb!important;border-radius:18px!important;background:#fff!important;box-shadow:0 5px 22px #12304408!important}
        #vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card h2,#vh26-presenter-mode .vh26-presenter-safety-content h2{margin:0 0 12px!important;padding:0 0 10px!important;border-bottom:1px solid #e9eef2!important;color:#004d71!important;font-size:19px!important;font-weight:650!important;letter-spacing:-.015em!important}
        #vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card p,#vh26-presenter-mode .vh26-presenter-safety-panel p,#vh26-presenter-mode .vh26-presenter-safety-content p{margin:9px 0!important;color:#29485b!important;font-size:16px!important;line-height:1.65!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important}
        #vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card p.empty{color:#687c88!important;font-style:italic!important}
        #vh26-presenter-mode .vh26-presenter-actions-card span{color:#597182!important;font-size:14px!important}
        #vh26-presenter-mode .vh26-presenter-finance-panel{overflow-x:auto!important}
        #vh26-presenter-mode .vh26-presenter-finance-card{overflow:hidden!important;padding:0!important}
        #vh26-connected-dashboard #vh26-presenter-mode #vh26-presenter-slide .vh26-presenter-finance-source-caption,#vh26-connected-dashboard #vh26-presenter-mode #vh26-presenter-slide .vh26-presenter-finance-source{margin:12px 18px!important}
        #vh26-presenter-mode .vh26-presenter-demo-tag{display:inline-block!important;margin:0 0 10px!important;padding:5px 9px!important;border-radius:999px!important;background:#fff1e6!important;color:#783d0c!important;font-size:11px!important;font-weight:800!important;letter-spacing:.04em!important}
        #vh26-presenter-mode .vh26-presenter-bid-link-card a{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:44px!important;padding:10px 16px!important;border-radius:10px!important;color:#fff!important;text-decoration:none!important;font-weight:700!important}
        #vh26-presenter-mode .vh26-presenter-revenue-title{padding:12px 18px!important;background:#ff6b00!important;color:#173448!important;text-align:center!important;font-size:16px!important;font-weight:800!important;letter-spacing:.04em!important}
        #vh26-presenter-mode .vh26-presenter-revenue-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:0 24px!important;padding:16px 20px 8px!important}
        #vh26-presenter-mode .vh26-presenter-revenue-item{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(110px,.75fr)!important;gap:12px!important;padding:8px 4px!important;border-bottom:1px solid #e7edf1!important}
        #vh26-presenter-mode .vh26-presenter-revenue-item strong{color:#173448!important;text-transform:uppercase!important;font-size:13px!important}
        #vh26-presenter-mode .vh26-presenter-revenue-item span{text-align:right!important;color:#173448!important;font-variant-numeric:tabular-nums!important}
        #vh26-presenter-mode .vh26-presenter-revenue-item span.vh26-presenter-variance-favourable{color:#17633c!important;font-weight:750!important}
        #vh26-presenter-mode .vh26-presenter-revenue-item span.vh26-presenter-variance-adverse{color:#a12a16!important;font-weight:750!important}
        #vh26-presenter-mode .vh26-presenter-revenue-item span.vh26-presenter-variance-unavailable{color:#687c88!important;font-weight:500!important}
        #vh26-presenter-mode .vh26-presenter-revenue-status,#vh26-presenter-mode .vh26-presenter-finance-source{margin:12px 18px!important;color:#526c7b!important;font-size:12px!important}
        #vh26-presenter-mode .vh26-presenter-actions-card{padding:18px!important}
        #vh26-presenter-mode .vh26-presenter-actions-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important}
        #vh26-presenter-mode .vh26-presenter-actions-head h2{flex:1!important;margin-bottom:0!important}
        #vh26-presenter-mode .vh26-presenter-actions-intro,#vh26-presenter-mode .vh26-presenter-actions-feedback{font-size:12px!important;line-height:1.4!important}
        #vh26-presenter-mode .vh26-presenter-create-action-toggle,#vh26-presenter-mode .vh26-presenter-create-action button{min-height:38px!important;padding:8px 12px!important;border-radius:8px!important;font-size:13px!important}
        #vh26-presenter-mode .vh26-presenter-create-action{display:grid!important;grid-template-columns:2fr 1fr 1fr auto!important;gap:8px!important;align-items:end!important;margin:14px 0!important;padding:12px!important;background:#f6f8f9!important;border:1px solid #e2e9ee!important;border-radius:10px!important}
        #vh26-presenter-mode .vh26-presenter-create-action[hidden]{display:none!important}
        #vh26-presenter-mode .vh26-presenter-create-action textarea,#vh26-presenter-mode .vh26-presenter-create-action input,#vh26-presenter-mode .vh26-presenter-action-table input,#vh26-presenter-mode .vh26-presenter-action-table select{box-sizing:border-box!important;width:100%!important;min-width:0!important;min-height:38px!important;padding:8px 9px!important;border:1px solid #cbd6de!important;border-radius:8px!important;background:#fff!important;color:#173448!important;font:400 13px Inter,Segoe UI,Arial,sans-serif!important}
        #vh26-presenter-mode .vh26-presenter-action-table{width:100%!important;border-collapse:collapse!important;font-size:12px!important}
        #vh26-presenter-mode .vh26-presenter-action-table th{text-align:left!important;padding:8px 6px!important;border-bottom:1px solid #dce5eb!important;color:#5b7181!important;font-size:11px!important}
        #vh26-presenter-mode .vh26-presenter-action-table td{padding:8px 6px!important;border-bottom:1px solid #e5ebef!important;vertical-align:middle!important}
        #vh26-presenter-mode .vh26-presenter-action-table td:last-child{width:74px!important}
        #vh26-presenter-mode .vh26-presenter-action-table .vh26-presenter-delete-action{min-height:34px!important;padding:6px 9px!important;border-color:#d58484!important;color:#9c2828!important;font-size:12px!important}
        #vh26-presenter-mode .vh26-presenter-finance-table{width:100%!important;min-width:960px!important;border-collapse:collapse!important;background:#fff!important;font-size:14px!important}
        #vh26-presenter-mode .vh26-presenter-finance-table th{padding:11px 9px!important;border-bottom:1px solid #dce5eb!important;background:#f5f8fa!important;color:#31566d!important;text-align:left!important;font-weight:700!important;white-space:nowrap!important}
        #vh26-presenter-mode .vh26-presenter-finance-table td{padding:11px 9px!important;border-bottom:1px solid #e6edf1!important;color:#29485b!important;white-space:nowrap!important;font-variant-numeric:tabular-nums!important}
        #vh26-presenter-mode .vh26-presenter-finance-table .vh26-finance-variance-favourable{color:#17633c!important;font-weight:750!important}
        #vh26-presenter-mode .vh26-presenter-finance-table .vh26-finance-variance-adverse{color:#a12a16!important;font-weight:750!important}
        #vh26-presenter-mode .vh26-presenter-finance-table .vh26-finance-variance-unavailable{color:#687c88!important;font-weight:500!important}
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
        #vh26-connected-dashboard #vh26-presenter-mode #vh26-presenter-slide{display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:15px!important;width:calc(100% - 44px)!important;max-width:780px!important;margin:4px auto 0!important;padding:12px 0 calc(108px + env(safe-area-inset-bottom))!important;overflow-x:hidden!important;overflow-y:auto!important;background:transparent!important}
        #vh26-connected-dashboard #vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card{flex:0 0 auto!important;grid-column:auto!important;height:auto!important;min-height:0!important;width:100%!important}
        #vh26-connected-dashboard #vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-finance-card{display:block!important;height:auto!important;min-height:0!important;overflow:hidden!important;padding:0!important}
        @media(max-width:850px){#vh26-presenter-mode .vh26-presenter-overview-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
        @media(max-width:700px){#vh26-presenter-mode .vh26-presenter-create-action{grid-template-columns:1fr 1fr!important}#vh26-presenter-mode .vh26-presenter-action-table{min-width:640px!important}#vh26-presenter-mode .vh26-presenter-actions-card{overflow-x:auto!important}}
        @media(max-width:560px){#vh26-presenter-mode #vh26-presenter-slide{width:calc(100% - 28px)!important;padding:10px 0 calc(105px + env(safe-area-inset-bottom))!important}#vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-card,#vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-heading,#vh26-presenter-mode #vh26-presenter-slide>.vh26-presenter-safety-content,#vh26-presenter-mode .vh26-presenter-safety-panel{padding:17px!important}#vh26-presenter-mode .vh26-presenter-tabs{justify-content:flex-start!important;flex-wrap:nowrap!important;overflow-x:auto!important}#vh26-presenter-mode .vh26-presenter-tabs button{flex:0 0 auto!important}#vh26-presenter-mode .vh26-presenter-revenue-grid{grid-template-columns:1fr!important}}
        #vh26-connected-dashboard #vh26-presenter-mode #vh26-presenter-slide.vh26-presenter-finance-active{box-sizing:border-box!important;width:calc(100% - 44px)!important;max-width:1240px!important}
        #vh26-presenter-mode .vh26-presenter-company-overview{box-sizing:border-box!important;width:100%!important;display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important}
        #vh26-presenter-mode .vh26-presenter-company-overview>h2{grid-column:1/-1!important}
        #vh26-presenter-mode .vh26-presenter-company-overview>article{box-sizing:border-box!important;min-width:0!important}
        #vh26-presenter-mode .vh26-presenter-finance-scroll{box-sizing:border-box!important;width:100%!important;overflow-x:auto!important;overscroll-behavior-inline:contain!important}
        @media(max-width:800px){#vh26-presenter-mode .vh26-presenter-company-overview{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
        @media(max-width:560px){#vh26-connected-dashboard #vh26-presenter-mode #vh26-presenter-slide.vh26-presenter-finance-active{width:calc(100% - 28px)!important}#vh26-presenter-mode .vh26-presenter-company-overview{grid-template-columns:1fr!important}}
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
    installSafetyMomentDiagnostics();
    installDepartmentChooserStyle();
    installPresenterRestoration();
    const root = workspace();
    if (!root || root.dataset.autosaveReady) return;
    root.dataset.autosaveReady = 'true';
    const dashboard = document.getElementById('vh26-connected-dashboard');
    dashboard?.addEventListener('change', event => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement) || target.id !== 'vh26-host-week-select') return;
      const presenter = document.getElementById('vh26-presenter-mode');
      // Keep the user's choice while the host dashboard is active. Presenter rendering
      // can reinitialize the host selector; those programmatic changes must not replace it.
      if (!presenter || presenter.hidden) {
        try { sessionStorage.setItem('vh26-presenter-week-preference', target.value); } catch {}
        if (presenter) {
          delete presenter.dataset.vh26WeekRestoreFor;
          delete presenter.dataset.vh26WeekRestoreAttempts;
          delete presenter.dataset.vh26WeekRestoreTimer;
        }
      }
    }, true);
    dashboard?.addEventListener('click', event => {
      if (event.target instanceof Element && event.target.closest('#vh26-dashboard-signout')) {
        try { sessionStorage.removeItem('vh26-presenter-week-preference'); } catch {}
      }
    }, true);
    dashboard?.addEventListener('click', event => {
      if (navigationReplay) return;
      const target = event.target instanceof Element ? event.target.closest('.vh26-sidebar nav button[data-connected-nav], #vh26-section-tabs button, .vh26-report-step-controls button, #vh26-back-departments') : null;
      if (!target || !(reportingDirty || reportingBusy || appDirtyNeedsClearing)) return;
      const intent = navigationIntent(target);
      if (!intent) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      runNavigation(intent, root);
    }, true);
    const weekSelect = root.querySelector('#vh26-week');
    lastSelectedWeek = weekSelect?.value || '';
    dashboard?.addEventListener('change', event => {
      if (!(event.target instanceof HTMLSelectElement) || !event.target.matches('#vh26-week')) return;
      const target = event.target;
      if (navigationReplay) { queueMicrotask(() => { lastSelectedWeek = target.value; }); return; }
      if (reportingDirty || reportingBusy || appDirtyNeedsClearing) {
        const requestedWeek = target.value;
        target.value = lastSelectedWeek;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        runNavigation({ kind: 'week', value: requestedWeek }, root);
        return;
      }
      queueMicrotask(() => { lastSelectedWeek = target.value; });
    }, true);
    root.addEventListener('input', event => {
      const el = event.target;
      if (!(el instanceof HTMLElement)) return;
      if (el.matches('#vh26-section-notes, #vh26-entries [data-prop], #vh26-hsqe-fields [data-hsqe-field], #vh26-pipeline-notes')) {
        appDirtyNeedsClearing = true;
        scheduleSectionSave();
        return;
      }
      const card = el.closest('.vh26-pipeline-card');
      if (card && el.matches('[data-pipeline-prop]')) {
        appDirtyNeedsClearing = true;
        pendingOpportunityCards.add(card);
        reportingDirty = true;
        reportingEditVersion++;
        status('Changes will save automatically…');
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
      updateHsqeReviewControl();
      simplifyNarrativeEntries(root);
      suppressInternalStatusMessages(root);
    });
    observer.observe(root, { childList: true, subtree: true });
    hideOpportunitySaveButtons(root);
    applyReportingSpellcheck(root);
    updateHsqeReviewControl();
    simplifyNarrativeEntries(root);
    suppressInternalStatusMessages(root);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install);
  else install();
})();
