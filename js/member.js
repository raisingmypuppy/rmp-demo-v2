/* Static member demo. All changes exist only in memory for this page visit.
   No storage, authentication, AI, email, payment, or external requests. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const main = $('#member-main');
  const dialog = $('#member-dialog');
  const dialogContent = $('#dialog-content');
  const stateControl = $('#demo-state');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const winniePhoto = 'assets/images/winnie-hero.png';
  const state = {
    membership: 'active', view: 'helper', topic: 'work', profileReady: true,
    dogs: [{name:'Winnie', breed:'Bernedoodle', gender:'Female', birthdate:'', estimated:false, photo:winniePhoto}],
    draft:'', photo:'', formPhoto:'', sessionSaved:true, guideChecks:[false,false,false], guideNotes:'',
    planner:0, edition:'color', dialogOrigin:null
  };
  const plannerPages = [
    ['Potty Training Roadmap','potty-training-roadmap.png'],
    ['Weekly Puppy Routine Tracker','weekly-puppy-routine-tracker.png'],
    ['Puppy-Proofing Checklist','puppy-proofing-checklist.png'],
    ['Your Puppy’s First Week','your-puppys-first-week.png'],
    ['People & Handling','people-and-handling.png'],
    ['Training Log','training-log.png']
  ];
  const conversations = {
    work: {
      title:'Settling while I work', subtitle:'Pick up where you left off',
      question:'Winnie is my 5-month-old female Bernedoodle and I work from home. If I put her in the playpen where she can see me, she barks and loses her mind. Weirdly, if I leave the room, she settles faster. What am I doing wrong?',
      answer:'Seeing you but not being able to reach you may actually be harder for Winnie than having you out of sight. Since she settles faster when you leave the room, use that as your starting point.',
      steps:[['Use short out-of-sight work blocks first.','Start where Winnie settles faster, instead of making her practice the harder version from the outset.'],['Give her something specific to do when you leave.','Offer a stuffed toy, chew, or quiet activity before stepping away.'],['Practice seeing you separately.','Begin with a few seconds before barking starts, then gradually increase the time.']]
    },
    tired: {
      title:'Why she gets wild when tired', subtitle:'Your conversation, saved.',
      question:'Winnie gets bitey and races around the room in the evening, even after a busy day. More play seems to make it worse. What should I try?',
      answer:'The pattern is useful: more activity is winding Winnie up instead of helping her settle. Try a quieter end to the day and look at how long she has been awake.',
      steps:[['Start winding down earlier.','Note when the biting starts and begin a quieter routine before that point.'],['Make the next activity predictable.','Offer a potty break, then a quiet place to rest with fewer distractions.'],['Track the pattern.','Record awake time and what helped her settle, so you can adjust the next evening.']]
    }
  };
  const icons = {
    photo:'<path d="m8 12 5-5a3 3 0 0 1 4 4l-7 7a5 5 0 0 1-7-7l8-8"/><path d="m6 14 7-7"/>',
    mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
    arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
    guide:'<path d="M6 2h8l4 4v16H6zM14 2v5h4M9 11h6M9 15h6M9 19h4"/>'
  };
  const icon = name => `<svg class="member-icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
  const primary = (text, action, extra = '') => `<button type="button" class="approved-gold-button member-primary" data-action="${action}" ${extra}>${text} <span aria-hidden="true">→</span></button>`;
  const isMember = () => state.membership === 'active';
  function toast(text) {
    $('#member-status').textContent = text;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { $('#member-status').textContent = ''; }, 4200);
  }
  function age(dog) {
    if (!dog.birthdate) return dog.name === 'Winnie' ? '5 months' : 'Birthdate not added';
    const born = new Date(dog.birthdate+'T12:00:00'), now = new Date();
    let months = (now.getFullYear()-born.getFullYear())*12 + now.getMonth()-born.getMonth();
    if (now.getDate()<born.getDate()) months--;
    if (months<1) return 'Under 1 month';
    if (months<12) return `${months} month${months===1?'':'s'}`;
    const years = Math.floor(months/12);
    return `${years} year${years===1?'':'s'}`;
  }
  const dogLine = dog => `${age(dog)} · ${dog.gender} · ${dog.breed}`;
  function updateNavigation() {
    document.querySelectorAll('.member-header [data-view]').forEach(link => {
      const current = link.dataset.view === (state.view==='thread'?'helper':state.view);
      if (current) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
    });
    stateControl.value = state.membership;
  }
  function go(view, focus = true) {
    state.view = view;
    clearTimeout(toast.timer);
    $('#member-status').textContent = '';
    if (view==='setup') state.formPhoto='';
    render();
    if (focus) { main.focus({preventScroll:true}); window.scrollTo({top:0,behavior:'instant'}); }
  }
  function render() {
    updateNavigation();
    if (state.view==='setup') main.innerHTML=setup();
    else if (state.view==='dogs') main.innerHTML=dogsView();
    else if (state.view==='saved') main.innerHTML=savedView();
    else if (state.view==='planner') main.innerHTML=plannerView();
    else if (state.view==='thread') main.innerHTML=threadView();
    else main.innerHTML=home();
    const composer=$('#helper-question');
    if (composer) { composer.value=state.draft; $('#member-send').disabled=!state.draft.trim(); }
  }
  function dogContext() {
    const dog=state.dogs[0];
    return `<div class="member-context"><button class="dog-context" data-view="dogs" aria-label="View ${escape(dog.name)}’s dog profile">${dog.photo?`<img src="${escape(dog.photo)}" alt="${escape(dog.name)}">`:`<span class="dog-placeholder" aria-hidden="true">${escape(dog.name[0])}</span>`}<span><strong>${escape(dog.name)} <span aria-hidden="true">⌄</span></strong><small>${escape(dogLine(dog))}</small></span></button><span class="member-state-note">${isMember()?'Unlimited Puppy Helper':state.membership==='available'?'One session on us':'First session used'}</span></div>`;
  }
  function composer() {
    return `<form id="helper-form" class="member-composer" aria-label="Puppy Helper preview"><label class="sr-only" for="helper-question">What’s going on with ${escape(state.dogs[0].name)} today?</label><textarea id="helper-question" placeholder="Tell the Puppy Helper what’s happening…" maxlength="3000" rows="3"></textarea>${state.photo?`<div class="member-photo-preview"><img src="${escape(state.photo)}" alt="Your attached photo preview"><button type="button" data-action="remove-photo">Remove photo</button></div>`:''}<div class="composer-toolbar"><div class="composer-tools"><button type="button" data-action="attach" aria-label="Attach a photo">${icon('photo')}</button><button type="button" aria-label="Voice input preview" aria-disabled="true" title="Voice input preview">${icon('mic')}</button><input type="file" id="composer-photo" accept="image/*" hidden></div><button type="submit" class="composer-send" id="member-send" aria-label="Send question">${icon('arrow')}</button></div></form><div class="member-example"><span>Try a sample:</span><button data-topic="work">Settling while I work</button><button data-topic="tired">Wild when tired</button></div><p class="member-composer-note">Demo: Send opens a sample conversation. Questions and photos stay in this page.</p>`;
  }
  function home() {
    const dog=state.dogs[0], used=state.membership==='used';
    return `<section class="member-home">${dogContext()}<div class="member-helper-layout"><div class="member-helper-copy"><span class="member-eyebrow">Puppy Helper</span><h1>What’s going on<br>with ${escape(dog.name)} today?</h1>${used?`<p>Your first conversation is ready to revisit. Keep working through what’s happening with membership.</p><button class="member-link" data-open-topic="${state.topic}" style="margin-top:18px">Revisit your first conversation →</button>${upgrade()}`:`<p>Big problems or little questions. Get help that fits your dog, your home, and your day.</p>${!isMember()?'<p class="member-free-note">Your first session is on us. No card required.</p>':''}${composer()}`}</div><aside class="member-side-note"><span class="member-eyebrow">Built around your dog</span><p>Your dog profile gives the Puppy Helper a starting point. Add what’s different about today in your question.</p><a href="#dogs" data-view="dogs" class="member-link">View dog profile →</a></aside></div></section>${isMember()?`${savedSections()}${plannerBand()}`:previewBenefits()}`;
  }
  function upgrade() {
    return `<section class="member-upgrade"><span class="member-eyebrow">Keep going with RMP</span><h2>The next question.<br>The next step.</h2><p>Unlimited Puppy Helper sessions, saved conversations, personalized guides, and the full Puppy Planner.</p><div class="member-actions"><span class="member-price">$3.99/month or $30/year</span>${primary('See membership','plans')}</div></section>`;
  }
  function previewBenefits() {
    return `<section class="member-preview-benefits"><p><strong>Your conversations, guides, and planner. Together.</strong>Membership keeps your help close: reopen a conversation, use your personalized guide, and track progress in your Puppy Planner.</p><button class="member-link" data-action="plans">Explore membership →</button></section>`;
  }
  function recentList() {
    return `<ul class="member-list">${Object.entries(conversations).map(([key,c])=>`<li><button data-open-topic="${key}"><span><strong>${c.title}</strong><small>${c.subtitle}</small></span><span class="row-arrow" aria-hidden="true">↗</span></button></li>`).join('')}</ul>`;
  }
  function savedSections() {
    return `<div class="member-lower"><section><div class="member-section-heading"><h2>Pick up where you left off.</h2></div>${recentList()}</section><section class="member-guides"><div class="member-section-heading"><h2>Your personalized guides</h2></div><p>Steps you’ve made with the Puppy Helper.</p><button class="member-guide-row" data-action="guide">${icon('guide')}<span><strong>Winnie’s Work-From-Home Guide</strong><small>From “Settling while I work” · View guide ↗</small></span></button></section></div>`;
  }
  function plannerBand() {
    return `<section class="member-planner-band"><img src="assets/planner/weekly-puppy-routine-tracker.png" alt="Weekly Puppy Routine Tracker"><div><h2>Your Puppy Planner</h2><p>30+ printable pages. Full-color and printer-friendly.</p></div><a href="#planner" data-view="planner" class="member-secondary">View Puppy Planner <span aria-hidden="true">→</span></a></section>`;
  }
  function savedView() {
    if (!isMember()) return `<section class="member-view"><span class="member-eyebrow">Saved</span><h1>Keep useful help close.</h1><p>Membership brings your saved conversations and personalized guides together here.</p>${state.membership==='used'?`<button class="member-link" data-open-topic="${state.topic}">Revisit your first conversation →</button>`:''}${upgrade()}</section>`;
    return `<section class="member-view"><span class="member-eyebrow">Saved</span><h1>A good place to pick back up.</h1><p>Reopen a conversation or use the steps you made from it.</p>${savedSections()}</section>`;
  }
  function dogsView() {
    return `<section class="member-view"><span class="member-eyebrow">My Dogs</span><h1>The details you tell us once.</h1><p>Keep a dog profile for each dog in your home. Winnie is the active sample for this demo.</p>${state.dogs.map((dog,index)=>`<article class="member-profile">${dog.photo?`<img src="${escape(dog.photo)}" alt="${escape(dog.name)}">`:`<span class="dog-placeholder" aria-hidden="true">${escape(dog.name[0])}</span>`}<div><h2>${escape(dog.name)}${index===0?'<span class="member-badge">Active dog</span>':''}</h2><p>${escape(dogLine(dog))}</p><p>${dog.birthdate?`${dog.estimated?'Estimated birthdate':'Birthdate'}: ${escape(dog.birthdate)}`:'Birthdate: add a date or your best estimate.'}</p><button class="member-link" data-edit-dog="${index}">Edit dog profile</button></div></article>`).join('')}<div class="member-actions">${primary('Add another dog','add-dog')}</div><p class="member-preview-note">Profile edits last for this visit only.</p></section>`;
  }
  function profileFields(dog={name:'',breed:'',gender:'',birthdate:'',estimated:false}, onboarding=false) {
    const today=new Date().toLocaleDateString('en-CA');
    return `<label>Dog name<input name="name" autocomplete="off" maxlength="40" value="${escape(dog.name)}" required></label><label>Date of birth or estimated birthdate<input name="birthdate" type="date" max="${today}" value="${escape(dog.birthdate)}" required></label><label class="check-label"><input type="checkbox" name="estimated" ${dog.estimated?'checked':''}> This date is my best estimate.</label><small>We use this date to work out your dog’s current age.</small><div class="form-columns"><label>Breed<input name="breed" value="${escape(dog.breed)}" placeholder="Breed or mix" maxlength="70" required></label><label>Gender<select name="gender" required><option value="">Choose</option><option ${dog.gender==='Female'?'selected':''}>Female</option><option ${dog.gender==='Male'?'selected':''}>Male</option><option ${dog.gender==='Unknown'?'selected':''}>Unknown</option></select></label></div><label>Photo <span>(optional)</span><input name="photo" type="file" accept="image/*"></label><small id="photo-status">${onboarding?'You can add a photo later.':'Photo changes are shown for this visit.'}</small>`;
  }
  function setup() {
    return `<section class="member-onboarding"><div><span class="member-eyebrow">Start with a dog profile</span><h1>A little about your dog.</h1><p>A few details help the Puppy Helper start with your dog in mind. You can add another dog later.</p><form id="setup-form" class="member-form">${profileFields(undefined,true)}<div class="member-actions">${primary('Continue to Puppy Helper','submit-setup')}<button type="button" class="member-link" data-action="sample-profile">Use Winnie’s sample profile →</button></div></form><p class="member-preview-note">Winnie’s sample shows 5 months. Her birthdate hasn’t been added.</p></div><aside><img src="assets/images/winnie-hero.png" alt="Winnie, our sample Bernedoodle"><p>Winnie · 5 months · Female · Bernedoodle</p></aside></section>`;
  }
  function threadView() {
    const c=conversations[state.topic];
    return `<section class="member-view"><button class="member-link" data-view="helper">← Puppy Helper</button><div class="member-thread"><span class="member-eyebrow">${isMember()?'Saved conversation':'Your first session'} · Winnie</span><h1>${c.title}</h1><p class="member-preview-note">Sample conversation · This preview does not generate a new answer.</p><div class="member-thread-message owner"><span class="member-eyebrow">You</span><p>${c.question}</p></div><div class="member-thread-message"><span class="member-eyebrow">Puppy Helper</span><p>${c.answer}</p><p style="margin-top:16px">I’d start with these 3 changes:</p><ol>${c.steps.map(([title,text])=>`<li><strong>${title}</strong> ${text}</li>`).join('')}</ol>${isMember()?`<div class="member-actions">${state.topic==='work'?primary('Open step-by-step guide','guide'):'<button class="member-secondary" data-view="planner">Track her routine in the Puppy Planner</button>'}<button class="member-link" data-action="save-session">${state.sessionSaved?'Conversation saved ✓':'Save conversation'}</button></div>`:''}</div>${isMember()?`<div class="member-actions"><button class="member-link" data-action="follow-up">Ask a follow-up →</button></div>`:upgrade()}</div></section>`;
  }
  function plannerView() {
    if(!isMember()) return `<section class="member-view"><span class="member-eyebrow">Puppy Planner</span><h1>Put the advice to work.</h1><p>30+ printable pages to track potty breaks, build routines, and see what’s changing. Full-color and printer-friendly versions are included with membership.</p>${upgrade()}</section>`;
    const [name,file]=plannerPages[state.planner];
    return `<section class="member-view"><span class="member-eyebrow">Your Puppy Planner</span><h1>A place to see what’s working.</h1><p>30+ printable pages in full-color and printer-friendly versions. Choose the pages that help with what you’re working on today.</p><div class="member-planner-layout"><div><span class="member-eyebrow">Inside the planner</span><ul class="member-list">${plannerPages.map(([title],i)=>`<li><button data-page="${i}" aria-current="${i===state.planner}"><strong>${title}</strong></button></li>`).join('')}</ul><p class="member-preview-note" style="margin-top:18px">Six sample pages are available in this demo.</p></div><div><figure class="member-planner-page ${state.edition==='bw'?'printer-friendly':''}"><img src="assets/planner/${file}" alt="${name}" fetchpriority="high"></figure><div class="member-planner-toolbar"><label class="sr-only" for="planner-edition">Planner edition</label><select id="planner-edition"><option value="color" ${state.edition==='color'?'selected':''}>Full-color</option><option value="bw" ${state.edition==='bw'?'selected':''}>Printer-friendly preview</option></select><button class="member-link" data-action="print-planner">Print preview</button><a class="member-link" href="assets/planner/${file}" download>Download color sample</a></div>${state.edition==='bw'?'<p class="member-preview-note">Grayscale preview of this sample page.</p>':''}</div></div></section>`;
  }
  function showDialog(html) {
    if(!dialog.open) state.dialogOrigin=document.activeElement===document.body?main:document.activeElement;
    dialogContent.innerHTML=html;
    if(!dialog.open) dialog.showModal();
    dialog.scrollTop=0;
    $('.dialog-close').focus({preventScroll:true});
  }
  function closeDialog() { dialog.close(); const origin=state.dialogOrigin?.isConnected?state.dialogOrigin:main; origin.focus?.({preventScroll:true}); }
  function plansDialog() {
    showDialog(`<span class="member-eyebrow">RMP Membership</span><h2 id="dialog-title">Help for the next question, too.</h2><p>Unlimited Puppy Helper sessions, saved conversations, personalized guides, and your full Puppy Planner.</p><div class="member-plans"><label class="member-plan-choice"><input type="radio" name="plan" value="monthly" checked> Monthly<strong>$3.99</strong><small>per month</small></label><label class="member-plan-choice"><input type="radio" name="plan" value="yearly"> Annual<strong>$30</strong><small>per year</small></label></div><div class="member-actions">${primary('Preview active membership','activate')}</div><p class="member-preview-note">Demo only. No checkout or charge.</p>`);
  }
  function guideDialog(print=false) {
    showDialog(`<span class="member-eyebrow">${print?'Print preview':'Personalized guide'}</span><h2 id="dialog-title">Winnie’s Work-From-Home Guide</h2><p>Made from “Settling while I work.”</p><div class="member-guide-paper"><span class="member-eyebrow">Raising My Puppy · Built around Winnie</span><h3>Winnie’s Work-From-Home Guide</h3><p>Goal: settle comfortably while you work.</p>${['Work blocks: begin out of sight, where Winnie settles faster.','Before stepping away: offer a stuffed toy or quiet activity.','Separate practice: a few calm seconds with you in view. Build slowly.'].map((text,i)=>`<label><input type="checkbox" data-guide-check="${i}" ${state.guideChecks[i]?'checked':''}> <span>${text}</span></label>`).join('')}<label class="notes-label" for="guide-notes">What helped today?</label><textarea id="guide-notes" aria-label="Guide notes" placeholder="A few notes for next time…">${escape(state.guideNotes)}</textarea></div><div class="member-actions">${print?'<button class="member-secondary" data-action="guide">Back to guide</button>':'<button class="member-secondary" data-action="print-guide">Print preview</button><button class="member-link" data-action="source-session">Open source conversation →</button>'}</div><p class="member-preview-note">Checks and notes are temporary in this demo.</p>`);
  }
  function editDog(index=null) {
    state.formPhoto='';
    const dog=index===null?undefined:state.dogs[index];
    showDialog(`<span class="member-eyebrow">Dog profile</span><h2 id="dialog-title">${index===null?'Add another dog.':'The details that help.'}</h2><form id="dog-form" data-index="${index===null?'new':index}" class="member-form">${profileFields(dog)}<div class="member-actions">${primary('Use these details','submit-dog')}</div></form><p class="member-preview-note">Changes are kept for this page visit only.</p>`);
  }
  function accountDialog() {
    showDialog(`<span class="member-eyebrow">Your Account</span><h2 id="dialog-title">Your puppy life, together.</h2><p>${isMember()?'Active member preview. Unlimited Puppy Helper sessions and full member tools.':state.membership==='available'?'Your first session is on us. No card required.':'Your first session has been used. Membership keeps the help going.'}</p><div class="member-actions"><button class="member-secondary" data-action="account-dogs">My dog profiles</button>${primary(isMember()?'View membership':'See membership','plans')}</div><p class="member-preview-note">This is a sample account. No sign-in details or payment information are collected.</p>`);
  }
  function submitProfile(form, setupMode=false) {
    if(!form.reportValidity()) return;
    const data=new FormData(form), birthdate=data.get('birthdate');
    if(new Date(birthdate+'T12:00:00')>new Date()) { toast('Choose a birthdate or estimate that is today or earlier.'); return; }
    const index=setupMode?0:form.dataset.index;
    const existing=index==='new'?null:state.dogs[Number(index)];
    const dog={name:data.get('name').trim(),breed:data.get('breed').trim(),gender:data.get('gender'),birthdate,estimated:data.has('estimated'),photo:state.formPhoto||existing?.photo||''};
    if(!dog.name||!dog.breed){toast('Add a dog name and breed or mix.');return;}
    if(index==='new')state.dogs.push(dog);else state.dogs[Number(index)]=dog;
    state.profileReady=true;
    if(dialog.open)closeDialog();
    go(setupMode?'helper':'dogs');toast(setupMode?'Your dog profile is ready for this demo.':'Dog profile updated for this visit.');
  }
  async function readPhoto(file) {
    if(!file) return '';
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>8*1024*1024) {toast('Choose a JPG, PNG, WebP, or GIF under 8 MB.');return '';}
    return new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>{toast('That photo could not be opened. Try another image.');resolve('');};reader.readAsDataURL(file);});
  }
  document.addEventListener('click', event=> {
    const button=event.target.closest('[data-action],[data-view],[data-topic],[data-open-topic],[data-edit-dog],[data-page]');
    if(!button)return;
    event.preventDefault();
    if(button.dataset.view) { if(button.dataset.view==='helper'&&!state.profileReady)go('setup');else go(button.dataset.view);return; }
    if(button.dataset.topic) {state.topic=button.dataset.topic;state.draft=conversations[state.topic].question;render();$('#helper-question').focus();return;}
    if(button.dataset.openTopic) {state.topic=button.dataset.openTopic;go('thread');return;}
    if(button.dataset.editDog!==undefined){editDog(Number(button.dataset.editDog));return;}
    if(button.dataset.page!==undefined){state.planner=Number(button.dataset.page);render();return;}
    const action=button.dataset.action;
    if(action==='account')accountDialog();
    else if(action==='plans')plansDialog();
    else if(action==='activate'){state.membership='active';state.profileReady=true;closeDialog();go('helper');toast('Active member preview. No payment was made.');}
    else if(action==='sample-profile'){state.dogs[0]={name:'Winnie',breed:'Bernedoodle',gender:'Female',birthdate:'',estimated:false,photo:winniePhoto};state.profileReady=true;go('helper');}
    else if(action==='submit-setup')$('#setup-form').requestSubmit();
    else if(action==='submit-dog')$('#dog-form').requestSubmit();
    else if(action==='add-dog')editDog();
    else if(action==='account-dogs'){closeDialog();go('dogs');}
    else if(action==='attach')$('#composer-photo').click();
    else if(action==='remove-photo'){state.photo='';render();}
    else if(action==='guide')guideDialog();
    else if(action==='print-guide')guideDialog(true);
    else if(action==='source-session'){closeDialog();state.topic='work';go('thread');}
    else if(action==='save-session'){state.sessionSaved=true;render();toast('Conversation saved for this demo visit.');}
    else if(action==='follow-up'){go('helper');state.draft='';$('#helper-question').focus();toast('Try another question. This preview uses the two sample conversations.');}
    else if(action==='print-planner'){const [name,file]=plannerPages[state.planner];showDialog(`<span class="member-eyebrow">Print preview</span><h2 id="dialog-title">${name}</h2><div class="member-planner-page ${state.edition==='bw'?'printer-friendly':''}" style="margin-top:24px"><img src="assets/planner/${file}" alt="${name}"></div><p class="member-preview-note">Sample page preview. The full planner includes 30+ printable pages.</p>`);}
  });
  document.addEventListener('submit',event=>{
    if(!['helper-form','setup-form','dog-form'].includes(event.target.id))return;
    event.preventDefault();
    if(event.target.id==='setup-form'){submitProfile(event.target,true);return;}
    if(event.target.id==='dog-form'){submitProfile(event.target);return;}
    if(!state.draft.trim())return;
    if(state.membership==='used'){plansDialog();return;}
    if(state.membership==='available')state.membership='used';
    state.draft='';state.photo='';state.sessionSaved=false;go('thread');
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='guide-notes')state.guideNotes=event.target.value;
    if(event.target.id==='helper-question'){state.draft=event.target.value;$('#member-send').disabled=!state.draft.trim();event.target.style.height='auto';event.target.style.height=Math.min(230,event.target.scrollHeight)+'px';}
  });
  document.addEventListener('keydown',event=>{
    if(event.target.id==='helper-question'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('#helper-form').requestSubmit();}
  });
  document.addEventListener('change',async event=>{
    if(event.target.dataset.guideCheck!==undefined)state.guideChecks[Number(event.target.dataset.guideCheck)]=event.target.checked;
    if(event.target.id==='demo-state'){
      if(dialog.open)closeDialog();state.membership=event.target.value;state.draft='';state.photo='';state.topic='work';
      if(state.membership==='available'){state.profileReady=false;go('setup');}else{state.profileReady=true;go('helper');}
    }else if(event.target.id==='planner-edition'){state.edition=event.target.value;render();}
    else if(event.target.type==='file'){
      const input=event.target,photo=await readPhoto(input.files[0]);if(!photo)return;
      if(input.id==='composer-photo'){state.photo=photo;render();}else{state.formPhoto=photo;const status=$('#photo-status',input.closest('form'));if(status)status.textContent='Photo ready for this visit.';}
    }
  });
  $('#preview-setup').addEventListener('click',()=>{state.membership='available';state.profileReady=false;go('setup');});
  $('.dialog-close').addEventListener('click',closeDialog);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)closeDialog();}});
  const query=new URLSearchParams(location.search).get('state');
  if(['available','used','active'].includes(query)){state.membership=query;if(query==='available'){state.profileReady=false;state.view='setup';}}
  render();
})();
