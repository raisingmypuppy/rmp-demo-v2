/* Round 4B member experience. In-memory demo only; no network or persistent storage. */
(() => {
  'use strict';
  const $=(selector,root=document)=>root.querySelector(selector);
  const main=$('#member-main'),dialog=$('#member-dialog'),panel=$('#dialog-content');
  const planner=window.RMPMemberPlanner;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const samplePhoto='assets/images/winnie-hero.png';
  const guest={id:'guest',name:'',history:[],guides:[]};
  const state={dogs:window.RMPMemberData.samples(),active:'winnie',membership:'active',draft:'',attachment:'',current:null,origin:null,panel:'',profileMode:'sample',edition:'color',page:1,guide:null,urls:new Set()};
  const puppy=()=>state.dogs.find(d=>d.id===state.active)||guest;
  const member=()=>state.membership==='active';
  const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${({photo:'<rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="8" cy="10" r="1.5"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>'})[name]}</svg>`;
  const gold=(label,action,extra='')=>`<button type="button" class="gold-button" data-action="${action}" ${extra}>${esc(label)} <span aria-hidden="true">→</span></button>`;
  const back=()=>'<button type="button" class="panel-back" data-action="account">← Account</button>';
  const details=d=>[age(d),d.gender,d.breed].filter(Boolean).join(' · ');
  function age(d){
    if(!d.birthdate)return d.sampleAge||'';
    const b=new Date(d.birthdate+'T12:00:00'),n=new Date();
    const m=(n.getFullYear()-b.getFullYear())*12+n.getMonth()-b.getMonth()-(n.getDate()<b.getDate()?1:0);
    return m<1?'Under 1 month':m<12?`${m} month${m===1?'':'s'}`:`${Math.floor(m/12)} year${Math.floor(m/12)===1?'':'s'}`;
  }
  function toast(message){const output=dialog.open?$('#panel-status'):$('#member-status');if(output)output.textContent=message;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{if(output)output.textContent='';},4300);}
  function memory(d){
    const recent=d.history[0];
    if(recent)return {heading:recent.prompt||'Want to pick up where we left off?',copy:recent.memory||`Last time, we talked about “${recent.title}”. Tell me what happened since.`};
    return {heading:'What can I help you with today?',copy:d.name?`Tell me exactly what happened with ${d.name}. We’ll work out the next step.`:'Tell me exactly what happened. I’ll help you figure out what to do.'};
  }
  function switcher(d){return `<div class="puppy-switch"><button type="button" class="puppy-toggle" id="puppy-toggle" aria-expanded="false" aria-controls="puppy-menu"><strong>${esc(d.name||'Your puppy')}</strong><span class="chevron" aria-hidden="true">▾</span>${d.sample?'<span class="sample-label">SAMPLE PROFILE</span>':''}<small>${esc(d.name?details(d):'Add a name. Make this yours.')}</small></button><div class="puppy-menu" id="puppy-menu" hidden><div role="group" aria-label="Active puppy">${state.dogs.map(p=>`<button type="button" data-puppy="${p.id}" aria-pressed="${p.id===d.id}"><span class="initial" aria-hidden="true">${esc(p.name[0])}</span><span>${esc(p.name)}<small>${esc(details(p))}${p.sample?' · Sample':''}</small></span></button>`).join('')}</div><button type="button" class="add-puppy" data-action="add-puppy">+ ${state.dogs.length?'Add another puppy':'Add your puppy'}</button></div></div>`;}
  function composer(){return `<form class="composer" id="helper-form"><div id="attachment-preview">${attachmentHTML()}</div><label class="sr-only" for="helper-question">Tell the Puppy Helper what happened</label><textarea id="helper-question" placeholder="What’s going on with your puppy?" maxlength="3000" rows="2">${esc(state.draft)}</textarea><div class="composer-toolbar"><div class="composer-tools"><button type="button" class="icon-button" data-action="attach" aria-label="Attach a photo">${icon('photo')}</button><button type="button" class="icon-button" data-action="voice" aria-label="Try voice input">${icon('mic')}</button></div><button type="submit" class="send-button" id="send-question" ${!state.draft.trim()?'disabled':''}>Send ${icon('arrow')}</button></div><input type="file" id="composer-photo" accept="image/jpeg,image/png,image/webp,image/gif" hidden></form>`;}
  function attachmentHTML(){return state.attachment?`<div class="composer-attachment"><img src="${esc(state.attachment)}" alt="Photo attached to your question"><span>Photo attached</span><button type="button" data-action="remove-attachment">Remove</button></div>`:'';}
  function render(){
    const d=puppy(),m=memory(d),photo=d.photo||samplePhoto;
    main.innerHTML=`<section class="member-hero ${d.photo&&!d.sample?'is-upload':''}" aria-labelledby="helper-title"><img class="hero-photo" src="${esc(photo)}" alt="${d.photo?esc(d.name)+(d.sample?', sample puppy':''):"Winnie, the sample puppy standing in until you add a photo"}" fetchpriority="high"><div class="hero-shade"></div><div class="hero-content">${switcher(d)}<span class="eyebrow">Puppy Helper</span><h1 id="helper-title">${esc(m.heading)}</h1><p class="hero-memory">${esc(m.copy)}</p>${composer()}<p class="composer-footnote">Add a photo to show me the setup, or use the mic to talk it through.</p>${state.membership==='available'?'<p class="free-note">Your first session is on us.</p>':state.membership==='used'?'<p class="free-note">Your first session is complete. <button type="button" data-action="membership">Keep the help going →</button></p>':''}</div><div class="hero-caption ${!d.photo?'fallback':''}">${d.photo?`<span class="photo-name">${esc(d.name)}</span><p>${esc(details(d))}${d.sample?' · Sample puppy':''}</p><button type="button" class="photo-action" data-action="edit-active">${d.sample?'Make this yours':'Change photo'}</button>`:`<span class="photo-name">Winnie’s keeping your spot.</span><p>Add your puppy’s photo and they’ll take Winnie’s place here.</p><button type="button" class="photo-action" data-action="edit-active">Add ${d.name?esc(d.name)+'’s':'your puppy’s'} photo ↗</button>`}</div></section><section class="conversation-section" id="conversation" ${!state.current?'hidden':''} aria-labelledby="conversation-title"><div class="section-inner conversation-inner" id="conversation-content"></div></section><section class="recent-section" aria-labelledby="recent-title"><div class="section-inner"><div class="section-heading"><h2 id="recent-title">Where we left off</h2><span class="eyebrow">${d.name?'Just for '+esc(d.name):'Your latest conversations'}</span></div><ul class="recent-list">${d.history.slice(0,3).map((c,i)=>`<li><button type="button" data-conversation="${c.id}"><span><strong>${esc(c.title)}</strong><small>${esc(i===0?'Pick up where you left off':c.subtitle||'Your conversation, saved.')}</small></span><span class="row-arrow" aria-hidden="true">↗</span></button></li>`).join('')}</ul>${!d.history.length?'<p class="empty-note">Your next conversation starts above. Come back here to pick it up.</p>':''}<p class="recent-note">Your full conversation history is in <button type="button" class="text-link" data-action="history">Account ↗</button></p></div></section><section class="planner-reminder" aria-labelledby="planner-reminder-title"><div><span class="eyebrow">Included with your membership</span><h2 id="planner-reminder-title">Have you printed your free planner yet?</h2><p>Your Puppy Planner includes 30+ printable pages in full-color and printer-friendly versions.</p>${gold('Open my Puppy Planner','planner')}</div><div class="planner-art" aria-label="Puppy Planner cover and sample page"><div class="planner-cover"><span>RAISING MY PUPPY</span><strong>The Puppy<br>Planner</strong><small>Little steps.<br>A whole lot of progress.</small></div><img src="assets/planner/weekly-puppy-routine-tracker.png" alt="Weekly Puppy Routine Tracker sample page" loading="lazy"></div></section>`;
    if(state.current)renderConversation(false);
    $('#demo-state').value=state.membership;$('#demo-profile').value=state.profileMode;
    resizeComposer();updateMotion();
  }
  function resizeComposer(){const el=$('#helper-question');if(el){el.style.height='72px';el.style.height=Math.min(210,Math.max(72,el.scrollHeight))+'px';}}
  function renderConversation(scroll=true){
    const c=state.current,d=puppy();if(!c)return;
    $('#conversation').hidden=false;
    $('#conversation-content').innerHTML=`<div class="conversation-heading"><h2 id="conversation-title" tabindex="-1">${esc(c.title)}</h2><button type="button" class="text-link" data-action="new-question">Something new ↗</button></div><div class="thread-body reveal"><p class="question-line">${esc(c.question)}</p>${c.photo?`<img class="question-photo" src="${esc(c.photo)}" alt="Photo you attached to this conversation">`:''}<div class="reply-label"><span class="helper-monogram" aria-hidden="true">ph</span><span>Puppy Helper${c.sample?' · Example reply':' · Preview reply'}</span></div><p class="reply-text">${esc(c.answer)}</p><ol class="response-steps">${c.steps.map(([title,copy])=>`<li><div><strong>${esc(title)}</strong>${esc(copy)}</div></li>`).join('')}</ol><div class="action-row reply-actions">${gold(d.name?`Make ${d.name}’s step-by-step guide`:'Make my step-by-step guide','make-guide')}<button type="button" class="text-link" data-action="save-conversation">${c.saved?'Conversation saved ✓':'Save conversation'}</button><button type="button" class="text-link" data-action="follow-up">Follow up ↗</button></div><p class="reply-hint">${c.sample?'An example session you can turn into a guide.':'Static preview: this reply demonstrates the flow. It does not analyze your text or photo.'}</p></div>`;
    if(scroll){$('#conversation-title').focus({preventScroll:true});$('#conversation').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});}
  }
  function openPanel(html,type='standard'){
    if(!dialog.open)state.origin=document.activeElement;
    dialog.className=type==='account'?'account-tray':'';
    panel.innerHTML=html+'<p id="panel-status" role="status" aria-live="polite"></p>';
    if(!dialog.open)dialog.showModal();
    document.body.style.overflow='hidden';dialog.scrollTop=0;$('.dialog-close').focus({preventScroll:true});
  }
  function closePanel(){dialog.close();}
  dialog.addEventListener('close',()=>{document.body.style.overflow='';const origin=state.origin?.isConnected?state.origin:$('#puppy-toggle');origin?.focus({preventScroll:true});});
  function account(){state.panel='account';const d=puppy();openPanel(`<span class="eyebrow">Your Account</span><h2 id="dialog-title">Everything you’ve<br>kept along the way.</h2><p class="account-context">${esc(d.name||'Your puppy')}${d.name?' · '+esc(details(d)):''}</p><div class="account-links"><button data-action="profiles">Puppy profiles <span>↗</span></button><button data-action="history">Conversation history <span>↗</span></button><button data-action="guides">Your step-by-step guides <span>↗</span></button><button data-action="planner">Puppy Planner <span>↗</span></button><button data-action="membership">Membership & settings <span>↗</span></button></div><p>${member()?'Active membership · Help whenever you need it.':state.membership==='available'?'Your first session is on us.':'Your first free session is complete.'}</p>`,'account');}
  function profiles(){state.panel='profiles';openPanel(`${back()}<span class="eyebrow">Puppy profiles</span><h2 id="dialog-title">Who’s keeping you busy?</h2><ul class="overlay-list">${state.dogs.map(d=>`<li><button data-edit="${d.id}"><span><strong>${esc(d.name)}${d.sample?' · Sample profile':''}</strong><small>${esc(details(d))}${d.id===state.active?' · Active puppy':''}</small></span><span class="row-arrow">↗</span></button></li>`).join('')}</ul>${!state.dogs.length?'<p>Add your puppy’s name and photo to make the Helper yours.</p>':''}<div class="action-row">${gold(state.dogs.length?'Add another puppy':'Add your puppy','add-puppy')}</div>`);}
  function editProfile(id=null){
    state.panel='profile';const d=state.dogs.find(x=>x.id===id)||{};
    openPanel(`${back()}<span class="eyebrow">${d.name?'Puppy details':'Your puppy'}</span><h2 id="dialog-title">${d.sample?'Make this yours.':d.name?`A little about ${esc(d.name)}.`:'Let’s meet your puppy.'}</h2><form id="profile-form" data-id="${esc(id||'')}" class="profile-form"><label>Puppy’s name<input name="name" value="${esc(d.sample?'':d.name)}" placeholder="Name" required maxlength="50" autocomplete="off"></label><div class="form-columns"><label>Birthdate or best estimate<input name="birthdate" type="date" value="${esc(d.birthdate)}" max="${new Date().toLocaleDateString('en-CA')}" required></label><label>Gender<select name="gender" required><option value="">Choose</option>${['Female','Male','Unknown'].map(g=>`<option ${g===d.gender?'selected':''}>${g}</option>`).join('')}</select></label></div><label>Breed or mix<input name="breed" value="${esc(d.sample?'':d.breed)}" placeholder="Breed or mix" maxlength="70" required></label><label>Photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label><div id="profile-photo-preview" class="photo-form-preview">${d.photo&&!d.sample?`<img src="${esc(d.photo)}" alt="Current puppy photo"><span>Your current photo</span>`:'Choose a photo for the hero, or add it later.'}</div><div class="action-row"><button type="submit" class="gold-button">Save puppy details <span aria-hidden="true">→</span></button></div><p class="panel-note">Your changes stay in this preview until the page reloads.</p></form>`);
    $('#profile-form').photoURL=d.photo&&!d.sample?d.photo:'';
  }
  function history(){state.panel='history';const d=puppy();openPanel(`${back()}<span class="eyebrow">${esc(d.name||'Your puppy')} · Conversation history</span><h2 id="dialog-title">Pick up the conversation.</h2><ul class="overlay-list">${d.history.map(c=>`<li><button data-conversation="${c.id}"><span><strong>${esc(c.title)}</strong><small>${c.saved?'Saved conversation':'This visit'}${c.sample?' · Sample':''}</small></span><span class="row-arrow">↗</span></button></li>`).join('')}</ul>${!d.history.length?'<p>Your conversations will appear here after you send your first question.</p>':''}`);}
  function guides(){state.panel='guides';const d=puppy();openPanel(`${back()}<span class="eyebrow">${esc(d.name||'Your puppy')} · Saved guides</span><h2 id="dialog-title">The next steps, ready.</h2><ul class="overlay-list">${d.guides.map(g=>`<li><button data-guide="${g.id}"><span><strong>${esc(g.title)}</strong><small>From “${esc(g.sourceTitle)}”</small></span><span class="row-arrow">↗</span></button></li>`).join('')}</ul>${!d.guides.length?'<p>Open any conversation, then choose the gold “Make my step-by-step guide” button. Your guide will be kept here.</p>':''}`);}
  function makeGuide(){
    if(!member()){membership();return;}
    const d=puppy(),c=state.current;if(!c)return;
    let g=d.guides.find(x=>x.source===c.id);
    if(!g){g={id:crypto.randomUUID(),source:c.id,sourceTitle:c.title,title:`${d.name?d.name+'’s':'My'} ${c.type==='work'?'Work-From-Home':c.type==='tired'?'Evening Wind-Down':c.type==='night'?'Early Morning':'Step-by-Step'} Guide`,steps:structuredClone(c.steps),checks:c.steps.map(()=>false),notes:'',question:c.question};d.guides.unshift(g);}
    state.guide=g;guidePanel();
  }
  function guidePaper(g){return `<article class="guide-paper"><span class="eyebrow">Raising My Puppy · Built around ${esc(puppy().name||'your puppy')}</span><h3>${esc(g.title)}</h3><p class="guide-source">From: ${esc(g.sourceTitle)}</p>${g.steps.map(([title,copy],i)=>`<label><input type="checkbox" data-guide-check="${i}" ${g.checks[i]?'checked':''}><span><strong>${esc(title)}</strong><br>${esc(copy)}</span></label>`).join('')}<label class="guide-notes-label" for="guide-notes">What helped today?</label><textarea id="guide-notes" placeholder="Keep a note for next time…" maxlength="2000">${esc(g.notes)}</textarea></article>`;}
  function guidePanel(){state.panel='guide';const g=state.guide;openPanel(`${back()}<span class="eyebrow">Your personalized guide · Saved</span><h2 id="dialog-title">A few steps to try next.</h2>${guidePaper(g)}<div class="action-row">${gold('Print guide','print-guide')}<button class="text-link" data-action="source-conversation">Open source conversation ↗</button></div><p class="panel-note">Checks and notes are kept for this demo visit.</p>`);}
  function plannerChoice(){
    if(!member()){membership();return;}
    state.panel='planner';openPanel(`${back()}<span class="eyebrow">Your Puppy Planner</span><h2 id="dialog-title">Print it your way.</h2><p>Same purpose. Two intentionally different designs.</p><div class="edition-choices"><section class="edition-choice"><div class="edition-preview"><img src="assets/planner/weekly-puppy-routine-tracker.png" alt="Full-color tracker with navy headings, blue fills and colored row labels"></div><h3>Full-color</h3><p>Rich color, decorative details and a polished finish for your binder.</p>${gold('Open full-color planner','edition-color')}</section><section class="edition-choice"><div class="edition-preview">${planner.lowInk(1)}</div><h3>Printer-friendly</h3><p>White pages, light rules and minimal decoration. Made to use less ink.</p><button type="button" class="secondary-button" data-action="edition-ink">Open printer-friendly planner →</button></section></div><p class="panel-note">Six sample pages are available in this demo. The full membership planner includes 30+ pages.</p>`);
  }
  function plannerView(){state.panel='planner-page';openPanel(`<button type="button" class="panel-back" data-action="planner">← Both planner versions</button><span class="eyebrow">Puppy Planner · ${state.edition==='ink'?'Printer-friendly':'Full-color'}</span><h2 id="dialog-title">${planner.pages[state.page][0]}</h2><div class="planner-toolbar"><label for="planner-page-select" class="sr-only">Choose a sample page</label><select id="planner-page-select">${planner.pages.map(([title],i)=>`<option value="${i}" ${i===state.page?'selected':''}>${i+1}. ${title}</option>`).join('')}</select><button class="text-link" data-action="switch-edition">Switch to ${state.edition==='ink'?'full-color':'printer-friendly'}</button></div><div class="planner-page-preview ${state.edition==='ink'?'low-ink':''}">${planner.page(state.page,state.edition)}</div><div class="action-row">${gold('Print this page','print-planner')}<button type="button" class="text-link" data-action="print-all">Print all 6 samples</button></div><p class="panel-note">${state.edition==='ink'?'Dedicated low-ink layout: white backgrounds, minimal fills and light borders.':'Full-color sample from your Puppy Planner.'} Choose “Save as PDF” in the print dialog to keep a copy.</p>`);}
  function membership(){state.panel='membership';openPanel(`${back()}<span class="eyebrow">Membership & settings</span><h2 id="dialog-title">${member()?'Help for whatever comes next.':'Keep the help going.'}</h2><p>${member()?'Your active member preview includes':'Membership includes'} unlimited Puppy Helper sessions, saved conversations, personalized guides and your Puppy Planner.</p><div class="membership-options"><label><input type="radio" name="membership-plan" value="monthly" checked> Monthly<strong>$3.99</strong><small>per month</small></label><label><input type="radio" name="membership-plan" value="annual"> Annual<strong>$30</strong><small>per year</small></label></div><p>Cancel anytime. Digital membership purchases are non-refundable.</p><div class="action-row">${gold(member()?'Preview membership settings':'Preview active membership',member()?'settings':'activate')}</div><p class="panel-note">Demo only. No checkout, charge or real account changes.</p>`);}
  function settings(){state.panel='settings';openPanel(`${back()}<span class="eyebrow">Membership settings</span><h2 id="dialog-title">You’re in control.</h2><p>This preview has no real account, email address or payment method. In the finished product, your plan and cancellation controls will live here.</p><div class="action-row"><button class="secondary-button" data-action="preview-cancel">Preview cancellation</button><button class="text-link" data-action="membership">View plans</button></div>`);}
  function voice(){state.panel='voice';openPanel(`<span class="eyebrow">Voice input preview</span><h2 id="dialog-title">Talk it through.</h2><p>This demo shows how a voice transcript goes into your message. The microphone is not recording.</p><label class="sr-only" for="voice-transcript">Sample voice transcript</label><textarea id="voice-transcript" class="voice-input">${esc(state.draft||'I tried the plan yesterday. Here’s what happened…')}</textarea><div class="action-row">${gold('Use this text','use-voice')}</div>`);}
  async function readPhoto(file){
    if(!file)return '';
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>8*1024*1024){toast('Choose a JPG, PNG, WebP or GIF under 8 MB.');return '';}
    const url=URL.createObjectURL(file);
    try{const image=new Image();image.src=url;await image.decode();state.urls.add(url);return url;}catch{URL.revokeObjectURL(url);toast('That image could not be opened. Choose another photo.');return '';}
  }
  function resetProfiles(mode){
    state.profileMode=mode;state.dogs=mode==='empty'?[]:window.RMPMemberData.samples(mode==='multiple');
    if(mode==='no-photo'){state.dogs[0]={id:'fido',name:'Fido',breed:'Bernedoodle',gender:'Male',sampleAge:'5 months',photo:'',sample:true,history:[],guides:[]};}
    state.active=state.dogs[0]?.id||'guest';state.current=null;state.draft='';state.attachment='';guest.history=[];guest.guides=[];render();
  }
  function previewReply(question,d){
    return {id:crypto.randomUUID(),title:question.length>56?question.slice(0,53)+'…':question,question,photo:state.attachment,saved:member(),type:'custom',sample:false,
      answer:`Let’s pin down the pattern${d.name?' with '+d.name:''}. The useful details are what happened just before, what your puppy did, and what changed afterward.`,
      steps:[['Describe one specific moment.','Write down where you were, what your puppy could see and what happened just before the behavior.'],['Notice what changed.','Compare the situation with a moment when things went more smoothly. Include your puppy’s rest and the activity just beforehand.'],['Bring those details into the next conversation.','Use the notes to explain what you tried and how your puppy responded. A photo can help show the setup.']],
      prompt:'Want to pick up where we left off?',memory:`Last time, you asked: “${question.length>100?question.slice(0,97)+'…':question}” Tell me what happened since.`};
  }
  async function printHTML(html){
    $('#print-area').innerHTML=html.replace(/ id="[^"]*"/g,'').replace(/ for="[^"]*"/g,'');
    await Promise.all([...$('#print-area').querySelectorAll('img')].map(image=>image.decode().catch(()=>{})));
    // Print content must be outside a modal dialog (browsers otherwise print the dialog only).
    const wasOpen=dialog.open;if(wasOpen)dialog.close();
    const restore=()=>{$('#print-area').innerHTML='';if(wasOpen){dialog.showModal();document.body.style.overflow='hidden';}window.removeEventListener('afterprint',restore);};
    window.addEventListener('afterprint',restore,{once:true});
    requestAnimationFrame(()=>requestAnimationFrame(()=>window.print()));
  }
  document.addEventListener('submit',event=>{
    if(event.target.id==='profile-form'){
      event.preventDefault();const form=event.target,data=new FormData(form);
      const name=data.get('name').trim(),breed=data.get('breed').trim(),birthdate=data.get('birthdate');
      if(!name||!breed||!birthdate||new Date(birthdate+'T12:00:00')>new Date()){toast('Add a name, breed and a birthdate that is today or earlier.');return;}
      const old=state.dogs.find(d=>d.id===form.dataset.id),isReplacement=old?.sample;
      const d={id:old?.id||crypto.randomUUID(),name,breed,birthdate,gender:data.get('gender'),photo:form.photoURL||'',sample:false,history:isReplacement?[]:old?.history||[],guides:isReplacement?[]:old?.guides||[]};
      if(old)state.dogs[state.dogs.indexOf(old)]=d;else state.dogs.push(d);
      state.active=d.id;state.current=null;state.draft='';state.attachment='';closePanel();render();toast(`${name}’s profile is ready for this visit.`);return;
    }
    if(event.target.id!=='helper-form')return;
    event.preventDefault();const question=state.draft.trim();if(!question)return;
    if(state.membership==='used'){membership();return;}
    const d=puppy(),c=previewReply(question,d);d.history.unshift(c);state.current=c;state.draft='';state.attachment='';
    if(state.membership==='available')state.membership='used';render();renderConversation(true);
  });
  document.addEventListener('click',event=>{
    const toggle=event.target.closest('#puppy-toggle');
    if(toggle){const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));$('#puppy-menu').hidden=open;return;}
    if(!event.target.closest('.puppy-switch')&&$('#puppy-menu')){$('#puppy-menu').hidden=true;$('#puppy-toggle').setAttribute('aria-expanded','false');}
    const b=event.target.closest('[data-action],[data-puppy],[data-conversation],[data-edit],[data-guide]');if(!b)return;
    if(b.dataset.puppy){state.active=b.dataset.puppy;state.current=null;state.draft='';state.attachment='';render();$('#puppy-toggle').focus({preventScroll:true});return;}
    if(b.dataset.edit){editProfile(b.dataset.edit);return;}
    if(b.dataset.conversation){state.current=puppy().history.find(c=>c.id===b.dataset.conversation);if(dialog.open)closePanel();renderConversation(true);return;}
    if(b.dataset.guide){state.guide=puppy().guides.find(g=>g.id===b.dataset.guide);guidePanel();return;}
    const action=b.dataset.action;
    const handlers={account,profiles,history,guides,planner:plannerChoice,membership,settings,voice,'make-guide':makeGuide,'add-puppy':()=>editProfile(),'edit-active':()=>editProfile(puppy().id==='guest'?null:puppy().id),
      attach:()=>$('#composer-photo').click(),
      'remove-attachment':()=>{state.attachment='';$('#attachment-preview').innerHTML='';$('#composer-photo').value='';},
      'edition-color':()=>{state.edition='color';plannerView();},'edition-ink':()=>{state.edition='ink';plannerView();},'switch-edition':()=>{state.edition=state.edition==='ink'?'color':'ink';plannerView();},
      'save-conversation':()=>{if(!member()){membership();return;}state.current.saved=true;renderConversation(false);toast('Conversation saved for this visit.');},
      'new-question':()=>{state.current=null;$('#conversation').hidden=true;state.draft='';$('#helper-question').value='';$('#send-question').disabled=true;resizeComposer();$('#helper-question').focus();},
      'follow-up':()=>{$('#helper-question').focus();},
      'source-conversation':()=>{state.current=puppy().history.find(c=>c.id===state.guide.source);closePanel();renderConversation(true);},
      'use-voice':()=>{state.draft=$('#voice-transcript').value.slice(0,3000);closePanel();$('#helper-question').value=state.draft;$('#send-question').disabled=!state.draft.trim();resizeComposer();$('#helper-question').focus();},
      activate:()=>{state.membership='active';closePanel();render();toast('Active member preview. No payment was made.');},
      'preview-cancel':()=>{openPanel(`${back()}<span class="eyebrow">Cancellation preview</span><h2 id="dialog-title">Membership canceled.</h2><p>In the finished product, access would continue through the paid period. No real membership has changed in this demo.</p>`);},
      'print-guide':()=>printHTML(`<div class="print-sheet">${guidePaper(state.guide)}</div>`),
      'print-planner':()=>printHTML(`<div class="print-sheet">${planner.page(state.page,state.edition)}</div>`),
      'print-all':()=>printHTML(planner.pages.map((_,i)=>`<div class="print-sheet">${planner.page(i,state.edition)}</div>`).join(''))};
    handlers[action]?.();
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='helper-question'){state.draft=event.target.value;$('#send-question').disabled=!state.draft.trim();resizeComposer();}
    if(event.target.id==='guide-notes'&&state.guide)state.guide.notes=event.target.value;
  });
  document.addEventListener('change',async event=>{
    const el=event.target;
    if(el.id==='demo-state'){if(dialog.open)closePanel();state.membership=el.value;state.current=null;state.draft='';state.attachment='';render();}
    else if(el.id==='demo-profile'){if(dialog.open)closePanel();resetProfiles(el.value);}
    else if(el.id==='planner-page-select'){state.page=Number(el.value);plannerView();}
    else if(el.dataset.guideCheck!==undefined&&state.guide)state.guide.checks[Number(el.dataset.guideCheck)]=el.checked;
    else if(el.type==='file'){
      const form=el.closest('form'),file=el.files[0];
      const url=await readPhoto(file);if(!url||!el.isConnected)return;
      if(el.id==='composer-photo'){state.attachment=url;$('#attachment-preview').innerHTML=attachmentHTML();}
      else{form.photoURL=url;$('#profile-photo-preview',form).innerHTML=`<img src="${esc(url)}" alt="New puppy hero photo"><span>Ready to take center stage.</span>`;}
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&!dialog.open&&$('#puppy-menu')&&!$('#puppy-menu').hidden){$('#puppy-menu').hidden=true;$('#puppy-toggle').setAttribute('aria-expanded','false');$('#puppy-toggle').focus();}
    if(event.target.id==='helper-question'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('#helper-form').requestSubmit();}
  });
  $('.dialog-close').addEventListener('click',closePanel);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closePanel();}});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let motionFrame=0;
  function updateMotion(){const photo=$('.hero-photo');if(!photo)return;if(reduced.matches||innerWidth<=760){photo.style.transform='none';return;}const y=Math.min(24,scrollY*.04);photo.style.transform=`translateY(${y}px) scale(1.065)`;}
  window.addEventListener('scroll',()=>{if(motionFrame||reduced.matches)return;motionFrame=requestAnimationFrame(()=>{updateMotion();motionFrame=0;});},{passive:true});
  window.addEventListener('resize',updateMotion);reduced.addEventListener('change',updateMotion);
  window.addEventListener('pagehide',()=>state.urls.forEach(url=>URL.revokeObjectURL(url)));
  const query=new URLSearchParams(location.search);
  if(['available','used','active'].includes(query.get('state')))state.membership=query.get('state');
  const mode=query.get('profile');if(['empty','sample','no-photo','multiple'].includes(mode))resetProfiles(mode);else render();
})();
