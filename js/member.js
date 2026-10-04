/* Round 4F. Static product prototype: scripted replies, simulated membership, device-local storage. */
(() => {
  'use strict';
  const $=(selector,root=document)=>root.querySelector(selector);
  const main=$('#member-main'),dialog=$('#member-dialog'),panel=$('#dialog-content');
  const planner=window.RMPMemberPlanner;
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const samplePhoto='assets/images/winnie-hero.png';
  const guest={id:'guest',name:'',history:[],guides:[]};
  const query=new URLSearchParams(location.search);
  const previewMode=query.get('preview');
  const testing=['available','used','subscribed','returning'].includes(previewMode)||query.get('test')==='1';
  const state={dogs:[],active:'guest',membership:'available',draft:'',attachment:'',current:null,origin:null,panel:'',profileMode:'empty',edition:'color',guide:null,inviteDismissed:false,urls:new Set(),photos:new Map()};
  let database=null,saveTimer;
  function mapStored(value,restore=false){
    if(restore&&value instanceof Blob){const url=URL.createObjectURL(value);state.urls.add(url);state.photos.set(url,value);return url;}
    if(!restore&&typeof value==='string'&&state.photos.has(value))return state.photos.get(value);
    if(Array.isArray(value))return value.map(v=>mapStored(v,restore));
    if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,mapStored(v,restore)]));
    return value;
  }
  function persist(){
    if(testing||!database)return;
    clearTimeout(saveTimer);saveTimer=setTimeout(()=>{
      const data=mapStored({dogs:state.dogs,guest,active:state.active,membership:state.membership,currentId:state.current?.id,inviteDismissed:state.inviteDismissed});
      const tx=database.transaction('member','readwrite');tx.objectStore('member').put(data,'state');
      tx.onerror=()=>toast('This browser could not save your latest changes. Keep this page open.');
    },100);
  }
  async function restoreMember(){
    if(testing)return;
    try{
      database=await new Promise((resolve,reject)=>{const r=indexedDB.open('rmp-member-round4d',1);r.onupgradeneeded=()=>r.result.createObjectStore('member');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.onblocked=()=>reject(new Error('Storage blocked'));});
      const raw=await new Promise((resolve,reject)=>{const r=database.transaction('member').objectStore('member').get('state');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
      if(!raw)return;const saved=mapStored(raw,true);
      state.dogs=saved.dogs||[];Object.assign(guest,saved.guest||{});state.active=saved.active||'guest';state.membership=saved.membership||'available';state.inviteDismissed=Boolean(saved.inviteDismissed);
      state.current=puppy().history.find(c=>c.id===saved.currentId)||puppy().history[0]||null;
    }catch{state.storageUnavailable=true;}
  }
  function messages(c){
    if(!c.messages)c.messages=[{role:'user',text:c.question,photo:c.photo||''},{role:'helper',text:c.answer,steps:c.steps||[]}];
    return c.messages;
  }
  const puppy=()=>state.dogs.find(d=>d.id===state.active)||guest;
  const member=()=>state.membership==='active';
  const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${({photo:'<rect x="3" y="5" width="18" height="15" rx="3"/><circle cx="8" cy="10" r="1.5"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',mic:'<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>'})[name]}</svg>`;
  const gold=(label,action,extra='')=>`<button type="button" class="gold-button" data-action="${action}" ${extra}>${esc(label)}</button>`;
  const back=()=>'<button type="button" class="panel-back" data-action="account"> Account</button>';
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
  function switcher(d){return `<div class="puppy-switch"><button type="button" class="puppy-toggle" id="puppy-toggle" aria-expanded="false" aria-controls="puppy-menu"><strong>${esc(d.name||'Your puppy')}</strong><span class="chevron" aria-hidden="true">▾</span><small>${esc(d.name?details(d):'Add your puppy’s details')}</small></button><div class="puppy-menu" id="puppy-menu" hidden><div role="group" aria-label="Active puppy">${state.dogs.map(p=>`<button type="button" data-puppy="${p.id}" aria-pressed="${p.id===d.id}"><span class="initial" aria-hidden="true">${esc(p.name[0]||'P')}</span><span>${esc(p.name||'Your puppy')}<small>${esc(details(p))}</small></span></button>`).join('')}</div><button type="button" class="add-puppy" data-action="add-puppy">+ ${state.dogs.length?'Add another puppy':'Add your puppy'}</button></div></div>`;}
  function composer(){return `<form class="composer" id="helper-form"><div id="attachment-preview">${attachmentHTML()}</div><label class="sr-only" for="helper-question">Tell the Puppy Helper what happened</label><textarea id="helper-question" placeholder="What’s going on with your puppy?" maxlength="3000" rows="2">${esc(state.draft)}</textarea><div class="composer-toolbar"><div class="composer-tools"><button type="button" class="icon-button" data-action="attach" aria-label="Attach a photo">${icon('photo')}</button><button type="button" class="icon-button" data-action="voice" aria-label="Voice input">${icon('mic')}</button></div><button type="submit" class="send-button" id="send-question" ${!state.draft.trim()?'disabled':''}>Send </button></div><input type="file" id="composer-photo" accept="image/jpeg,image/png,image/webp,image/gif" hidden></form>`;}
  function attachmentHTML(){return state.attachment?`<div class="composer-attachment"><img src="${esc(state.attachment)}" alt="Photo attached to your question"><span>Photo attached</span><button type="button" data-action="remove-attachment">Remove</button></div>`:'';}
  function plannerBanner(){
    const items=['Puppy’s First Week','Shopping List','Puppy Milestones','Medical Emergency Info','Medical Records','Puppy-Proofing','Training Log','Food Log','Socialization Log','Weekly Routine Tracker'];
    return `<section class="planner-banner" aria-label="Inside your Puppy Planner"><div class="planner-ticker" tabindex="0" aria-label="Planner contents; focus to pause scrolling"><div class="planner-ticker-track">${[0,1].map(n=>`<div class="planner-ticker-group" ${n?'aria-hidden="true"':''}>${items.map(item=>`<span>${item}</span>`).join('')}</div>`).join('')}</div></div></section>`;
  }
  function render(){
    const d=puppy(),m=memory(d),photo=d.photo||samplePhoto,uploaded=Boolean(d.photo&&!d.sample);
    main.innerHTML=`<section class="member-hero ${uploaded?'is-upload is-portrait':''}" aria-labelledby="helper-title">${uploaded?`<img class="hero-photo-backdrop" src="${esc(photo)}" alt="" aria-hidden="true">`:''}${uploaded?'<div class="hero-photo-stage">':''}<img class="hero-photo" src="${esc(photo)}" alt="${d.photo?esc(d.name||'Your puppy'):'Puppy photo placeholder, replaced when you upload your own'}" fetchpriority="high">${uploaded?'</div>':''}<div class="hero-shade"></div><div class="hero-profile">${switcher(d)}</div><div class="hero-content"><h1 id="helper-title">${esc(m.heading)}</h1><p class="hero-memory">${esc(m.copy)}</p><div class="photo-personalization"><button type="button" class="photo-action" data-action="edit-active">Customize with your puppy’s photo</button>${!d.photo?'<p>Your photo will replace the puppy shown here.</p>':''}</div></div></section>
    ${!d.history.length?`<section class="member-welcome section-inner"><h2>Welcome to Raising My Puppy.</h2><p>Ask the Puppy Helper anything that’s going on with your puppy, anytime. When you need something more structured, turn the conversation into a step-by-step guide and use the printable planner to keep things moving.</p></section>`:''}
    <section class="conversation-section" id="helper-session" aria-labelledby="session-title"><div class="section-inner conversation-inner"><div class="session-heading"><span class="eyebrow">A conversation you can come back to</span><h2 id="session-title" tabindex="-1">Puppy Helper</h2><p>${state.membership==='available'?'Tell me what happened. Your first question and answer are on us.':member()?'Talk it through, try something, then come back with what happened.':'Your first answer is here whenever you need it.'}</p></div><div class="session-module"><div id="conversation-heading" class="conversation-heading"></div><div id="conversation-content" class="chat-messages" role="log" aria-label="Puppy Helper conversation" aria-live="polite" aria-relevant="additions"></div><div class="session-compose">${composer()}<p class="composer-footnote" id="composer-note">Add a photo to show me the setup, or use the mic to talk it through.</p></div></div><div id="guide-area"></div><div id="membership-invitation"></div></div></section>
    <section class="recent-section" aria-labelledby="recent-title"><div class="section-inner"><div class="section-heading"><h2 id="recent-title">Where we left off</h2><span class="eyebrow">${d.name?'Just for '+esc(d.name):'Your latest conversations'}</span></div><p class="recent-explanation">Your recent conversations stay here so you can pick up where you stopped. Full history is saved in Account.</p><ul class="recent-list" id="recent-list"></ul><p class="empty-note" id="recent-empty"></p></div></section>
    ${plannerBanner()}<section class="planner-reminder" aria-labelledby="planner-reminder-title"><div><span class="eyebrow">Included with your membership</span><h2 id="planner-reminder-title">Have you printed your free planner yet?</h2><p>It’s more than a tracker. Your Puppy Planner gives you 30+ printable pages for the things you actually need to keep up with, from your puppy’s first week and shopping list to training, milestones, medical records, food, socialization, and daily routines.</p>${gold('Open my Puppy Planner','planner')}${!member()?'<small class="planner-lock-note">The complete planner unlocks with membership.</small>':''}</div><div class="planner-art" aria-label="Puppy Planner cover and sample page"><div class="planner-cover"><span>RAISING MY PUPPY</span><strong>The Puppy<br>Planner</strong><small>Little steps.<br>A whole lot of progress.</small></div><img src="assets/planner/weekly-puppy-routine-tracker.png" alt="Weekly Puppy Routine Tracker sample page" loading="lazy"></div></section>`;
    renderConversation(false);
    $('#demo-state').value=state.membership;$('#demo-profile').value=state.profileMode;
    resizeComposer();updateMotion();
    if(uploaded){
      const image=$('.hero-photo');
      const classifyPhoto=()=>{if(image.naturalWidth)image.closest('.member-hero').classList.toggle('is-portrait',image.naturalHeight>image.naturalWidth);};
      if(image.complete)classifyPhoto();else image.addEventListener('load',classifyPhoto,{once:true});
    }
  }
  function renderRecent(){
    const d=puppy(),list=member()?d.history.slice(0,3):[];
    $('#recent-list').innerHTML=list.map((c,i)=>`<li><button type="button" data-conversation="${c.id}"><span><strong>${esc(c.title)}</strong><small>${i===0?'Pick up where you left off':'Your conversation, saved.'}${d.guides.some(g=>g.source===c.id)?' · Guide created':''}</small></span></button></li>`).join('');
    $('#recent-empty').hidden=Boolean(list.length);
    $('#recent-empty').textContent=member()?'Your conversations will appear here as you start them.':state.membership==='available'?'Start your first conversation above.':'Your first answer stays above. Membership keeps your conversations here for later.';
  }
  function invitation(){
    if(state.membership!=='used')return '';
    if(state.inviteDismissed)return `<p class="invitation-dismissed">Your answer stays here. ${gold('Continue with RMP','membership')}</p>`;
    return `<section class="membership-invite" aria-labelledby="invite-title"><h3 id="invite-title">Want to keep going?</h3><p>With membership, keep talking with the Puppy Helper as long as you need, turn your conversations into printable step-by-step guides, save everything for later, and get the complete 30+ page Puppy Planner.</p><strong class="invite-price">$3.99/month or $30/year</strong><div class="action-row">${gold('Continue with RMP','membership')}<button type="button" class="text-link" data-action="dismiss-invitation">Not right now</button></div></section>`;
  }
  function resizeComposer(){const el=$('#helper-question');if(el){el.style.height='72px';el.style.height=Math.min(210,Math.max(72,el.scrollHeight))+'px';}}
  function messageHTML(message,i){
    if(message.role==='user')return `<div class="chat-message chat-user" data-message="${i}" aria-label="Your message"><p>${esc(message.text)}</p>${message.photo?`<img class="question-photo" src="${esc(message.photo)}" alt="Photo attached to this message">`:''}</div>`;
    return `<div class="chat-message chat-helper" data-message="${i}" aria-label="Puppy Helper reply"><div class="reply-label"><span class="helper-monogram" aria-hidden="true">ph</span><span>Puppy Helper</span></div><p class="reply-text">${esc(message.text)}</p>${message.steps?.length?`<ol class="response-steps">${message.steps.map(([title,copy])=>`<li><div><strong>${esc(title)}</strong>${esc(copy)}</div></li>`).join('')}</ol>`:''}</div>`;
  }
  function renderConversation(scroll=true,append=false){
    const c=state.current,log=$('#conversation-content');
    const all=c?messages(c):[];
    $('#conversation-heading').innerHTML=member()?'<button type="button" class="secondary-button new-conversation-button" data-action="new-question">Start a new conversation</button>':'';
    if(append)log.insertAdjacentHTML('beforeend',all.slice(log.children.length).map((m,i)=>messageHTML(m,i+log.children.length)).join(''));
    else log.innerHTML=all.map(messageHTML).join('');
    log.hidden=!all.length;
    $('#helper-question').placeholder=c?'Continue the conversation…':'What’s going on with your puppy?';
    $('#send-question').disabled=!state.draft.trim()||state.membership==='used';
    $('#helper-question').setAttribute('aria-describedby','composer-note');
    $('#composer-note').textContent=state.membership==='used'?'Your free answer is complete. Continue with membership to send your next message.':'Add a photo to show me the setup, or use the mic to talk it through.';
    $('#membership-invitation').innerHTML=invitation();renderGuideArea();renderRecent();
    if(scroll)log.lastElementChild?.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'nearest'});
  }
  function renderGuideArea(){
    const c=state.current,d=puppy(),area=$('#guide-area');
    if(!c||!messages(c).some(message=>message.role==='helper')){area.innerHTML='';return;}
    const g=member()?d.guides.find(guide=>guide.source===c.id):null,changed=g&&g.messageCount!==messages(c).length;
    area.innerHTML=`<div class="guide-offer"><p>No need to remember everything we just talked about. ${member()?'The':'With membership, the'} Puppy Helper can turn this conversation into a simple step-by-step guide you can save, print, and follow when you need it.</p>${gold(g?(changed?'Update my step-by-step guide':'View my step-by-step guide'):d.name?`Make ${d.name}’s step-by-step guide`:'Make my step-by-step guide','make-guide')}</div>${g?`<div class="inline-guide" id="generated-guide">${guidePaper(g,'inline')}<div class="guide-confirmation"><span>Saved to your guides${changed?' · More conversation available to include':''}.</span><button class="text-link" data-action="guides">Find it in Account</button></div><div class="action-row"><button type="button" class="secondary-button" data-action="save-conversation">Save conversation</button>${gold('Print guide','print-inline-guide')}</div></div>`:''}`;
  }
  function openPanel(html,type='standard'){
    if(!dialog.open)state.origin=document.activeElement;
    dialog.className=type==='account'?'account-tray':'';
    panel.innerHTML=html+'<p id="panel-status" role="status" aria-live="polite"></p>';
    if(!dialog.open)dialog.showModal();
    document.body.style.overflow='hidden';dialog.scrollTop=0;$('.dialog-close').focus({preventScroll:true});
  }
  function closePanel(){dialog.close();}
  dialog.addEventListener('close',()=>{document.body.style.overflow='';if(state.panel==='guide'&&state.current)renderConversation(false);const origin=state.origin?.isConnected?state.origin:$('#puppy-toggle');origin?.focus({preventScroll:true});});
  function account(){state.panel='account';const d=puppy();openPanel(`<span class="eyebrow">Your Account</span><h2 id="dialog-title">Everything you’ve<br>kept along the way.</h2><p class="account-context">${esc(d.name||'Your puppy')}${d.name?' · '+esc(details(d)):''}</p><div class="account-links"><button data-action="profiles">Puppy profiles </button><button data-action="history">Conversation history </button><button data-action="guides">Your step-by-step guides </button><button data-action="planner">Puppy Planner </button><button data-action="membership">Membership & settings </button></div><p>${member()?'Active membership · Help whenever you need it.':state.membership==='available'?'Your first session is on us.':'Your first free session is complete.'}</p>`,'account');}
  function profiles(){state.panel='profiles';openPanel(`${back()}<span class="eyebrow">Puppy profiles</span><h2 id="dialog-title">Who’s keeping you busy?</h2><ul class="overlay-list">${state.dogs.map(d=>`<li><button data-edit="${d.id}"><span><strong>${esc(d.name)}</strong><small>${esc(details(d))}${d.id===state.active?' · Active puppy':''}</small></span></button></li>`).join('')}</ul>${!state.dogs.length?'<p>Add your puppy’s name and photo to make the Helper yours.</p>':''}<div class="action-row">${gold(state.dogs.length?'Add another puppy':'Add your puppy','add-puppy')}</div>`);}
  function editProfile(id=null){
    state.panel='profile';const d=state.dogs.find(x=>x.id===id)||{};
    openPanel(`${back()}<span class="eyebrow">${d.name?'Puppy details':'Your puppy'}</span><h2 id="dialog-title">${d.name?`A little about ${esc(d.name)}.`:'Let’s meet your puppy.'}</h2><form id="profile-form" data-id="${esc(id||'')}" class="profile-form"><label>Puppy’s name<input name="name" value="${esc(d.name)}" placeholder="Name" maxlength="50" autocomplete="off"></label><div class="form-columns"><label>Birthdate or best estimate<input name="birthdate" type="date" value="${esc(d.birthdate)}" max="${new Date().toLocaleDateString('en-CA')}"></label><label>Gender<select name="gender"><option value="">Choose</option>${['Female','Male'].map(g=>`<option ${g===d.gender?'selected':''}>${g}</option>`).join('')}</select></label></div><label>Breed or mix<input name="breed" value="${esc(d.breed)}" placeholder="Breed or mix" maxlength="70"></label><div class="photo-upload"><h3>Make this page theirs.</h3><p>Add a photo and your puppy becomes the star of your RMP experience.</p><label class="photo-upload-label">Choose your puppy’s photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label><div id="profile-photo-preview" class="photo-form-preview">${d.photo&&!d.sample?`<img src="${esc(d.photo)}" alt="Current puppy photo"><span>Your current photo</span>`:'Their photo will be featured at the top of your RMP page. You can add it later, too.'}</div></div><div class="action-row"><button type="submit" class="gold-button">Save puppy details </button></div><p class="panel-note">Add what you know. You can fill in the rest later.</p></form>`);
    $('#profile-form').photoURL=d.photo&&!d.sample?d.photo:'';
  }
  function history(){if(!member()){lockedFeature('Saved conversation history');return;}state.panel='history';const d=puppy();openPanel(`${back()}<span class="eyebrow">${esc(d.name||'Your puppy')} · Conversation history</span><h2 id="dialog-title">Pick up the conversation.</h2><ul class="overlay-list">${d.history.map(c=>`<li><button data-conversation="${c.id}"><span><strong>${esc(c.title)}</strong><small>${c.saved?'Saved conversation':'This visit'}</small></span></button></li>`).join('')}</ul>${!d.history.length?'<p>Your conversations will appear here after you send your first question.</p>':''}`);}
  function guides(){if(!member()){lockedFeature('Saved step-by-step guides');return;}state.panel='guides';const d=puppy();openPanel(`${back()}<span class="eyebrow">${esc(d.name||'Your puppy')} · Saved guides</span><h2 id="dialog-title">The next steps, ready.</h2><ul class="overlay-list">${d.guides.map(g=>`<li><button data-guide="${g.id}"><span><strong>${esc(g.title)}</strong><small>From “${esc(g.sourceTitle)}”</small></span></button></li>`).join('')}</ul>${!d.guides.length?'<p>Open any conversation, then choose the gold “Make my step-by-step guide” button. Your guide will be kept here.</p>':''}`);}
  function makeGuide(){
    if(!member()){membership();return;}
    const d=puppy(),c=state.current;if(!c)return;
    let g=d.guides.find(x=>x.source===c.id);
    const steps=messages(c).filter(m=>m.role==='helper').flatMap(m=>m.steps||[]).filter((step,i,a)=>a.findIndex(x=>x[0]===step[0])===i);
    if(!g){g={id:crypto.randomUUID(),source:c.id,sourceTitle:c.title,title:`${d.name?d.name+'’s':'My'} ${c.type==='work'?'Work-From-Home':c.type==='tired'?'Evening Wind-Down':c.type==='night'?'Early Morning':'Step-by-Step'} Guide`,steps:[],checks:[],notes:'',question:c.question};d.guides.unshift(g);}
    g.checks=steps.map(([title])=>{const i=g.steps.findIndex(s=>s[0]===title);return i>=0?g.checks[i]:false;});g.steps=steps;g.messageCount=messages(c).length;
    c.saved=true;state.guide=g;persist();renderGuideArea();renderRecent();
    const created=$('#generated-guide');$('h3',created).focus({preventScroll:true});created.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'nearest'});
  }
  function guidePaper(g,scope='panel'){return `<article class="guide-paper" data-guide-id="${g.id}"><span class="eyebrow">Raising My Puppy · Built around ${esc(puppy().name||'your puppy')}</span><h3 tabindex="-1">${esc(g.title)}</h3><p class="guide-source">From: ${esc(g.sourceTitle)}</p>${g.steps.map(([title,copy],i)=>`<label><input type="checkbox" data-guide-check="${i}" ${g.checks[i]?'checked':''}><span><strong>${esc(title)}</strong><br>${esc(copy)}</span></label>`).join('')}<label class="guide-notes-label" for="guide-notes-${scope}">What helped today?</label><textarea id="guide-notes-${scope}" data-guide-notes placeholder="Keep a note for next time…" maxlength="2000">${esc(g.notes)}</textarea></article>`;}
  function guidePanel(){state.panel='guide';const g=state.guide;openPanel(`${back()}<span class="eyebrow">Your personalized guide · Saved</span><h2 id="dialog-title">A few steps to try next.</h2>${guidePaper(g)}<div class="action-row">${gold('Print guide','print-guide')}<button class="text-link" data-action="source-conversation">Open source conversation </button></div><p class="panel-note">Checks and notes are saved on this device.</p>`);}
  function plannerChoice(){
    if(!member()){lockedFeature('The complete Puppy Planner');return;}
    state.panel='planner';openPanel(`${back()}<span class="eyebrow">Your complete Puppy Planner</span><h2 id="dialog-title">Print it your way.</h2><p>Everything you need, in the edition that suits you.</p><div class="edition-choices">${['color','ink'].map(ed=>`<section class="edition-choice"><div class="edition-preview"><img src="${planner.image(ed,0)}" alt="${planner.editions[ed].label} cover"></div><h3>${planner.editions[ed].label}</h3><p>${ed==='color'?'Rich color and decorative details for screen viewing, professional printing or a colorful binder.':'A separate design with a clean cover, light pages and minimal decorative ink for home printing.'}</p><small class="edition-count">Complete ${planner.editions[ed].count}-page edition</small>${gold(ed==='color'?'Open full-color planner':'Open printer-friendly planner','edition-'+ed)}</section>`).join('')}</div>`);
  }
  function plannerView(){
    if(!member()){lockedFeature('The complete Puppy Planner');return;}
    state.panel='planner-page';const ed=state.edition,edition=planner.editions[ed];
    openPanel(`<button type="button" class="panel-back" data-action="planner"> Both planner editions</button><span class="eyebrow">Your complete Puppy Planner</span><h2 id="dialog-title">${edition.label}</h2><div class="document-toolbar"><button class="text-link" data-action="switch-edition">Switch to ${ed==='ink'?'full-color':'printer-friendly'}</button><a class="gold-button" href="${edition.pdf}" download>Download PDF </a><button class="secondary-button" data-action="print-planner">Print</button></div><div class="document-navigation"><label>Page <input id="document-page" type="number" min="1" max="${edition.count}" value="1" aria-label="Go to page"></label><span>of ${edition.count}</span><button class="text-link" data-action="go-page">Go </button><span>Scroll to browse the complete planner</span></div><div class="document-scroll" tabindex="0" role="region" aria-label="${edition.label}, all ${edition.count} pages">${edition.titles.map((title,i)=>`<figure class="document-page" id="document-page-${i+1}"><img src="${planner.image(ed,i)}" width="1600" height="2071" loading="${i<2?'eager':'lazy'}" alt="Page ${i+1}: ${esc(title)}"><figcaption>${i+1} / ${edition.count} · ${esc(title)}</figcaption></figure>`).join('')}</div><p class="panel-note">The complete original edition. Download the PDF for full-resolution printing and to choose individual pages in your PDF reader.</p>`,'viewer');
    dialog.classList.add('planner-viewer');
    const viewport=$('.document-scroll');let scheduled=false;
    viewport.addEventListener('scroll',()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;const top=viewport.getBoundingClientRect().top;const pages=[...viewport.querySelectorAll('.document-page')];const current=pages.findIndex(page=>page.getBoundingClientRect().bottom>top+40);$('#document-page').value=Math.max(1,current+1);});},{passive:true});
  }
  function lockedFeature(label){
    if(state.membership==='used'){membership();return;}
    openPanel(`${back()}<span class="eyebrow">Included with membership</span><h2 id="dialog-title">${esc(label)}</h2><p>Your first Puppy Helper question and answer are on us. Start there, then explore membership when you’re ready.</p><div class="action-row">${gold('Start my free conversation','return-to-chat')}</div>`);
  }
  function membership(){
    if(state.membership==='available'){lockedFeature('Start with your first question.');return;}
    state.panel='membership';openPanel(`${back()}<span class="eyebrow">Membership & settings</span><h2 id="dialog-title">${member()?'Help for whatever comes next.':'Continue the conversation.'}</h2><p>Keep talking with the Puppy Helper, create printable guides, save your conversations, and open the complete Puppy Planner.</p><div class="membership-options"><label><input type="radio" name="membership-plan" value="monthly" checked> Monthly<strong>$3.99</strong><small>per month</small></label><label><input type="radio" name="membership-plan" value="annual"> Annual<strong>$30</strong><small>per year</small></label></div><p>Cancel anytime. Digital membership purchases are non-refundable.</p><div class="action-row">${gold(member()?'Membership settings':'Continue with RMP',member()?'settings':'activate')}</div><p class="panel-note">Product preview: this unlocks the member experience without checkout or a charge.</p>`);
  }
  function settings(){state.panel='settings';openPanel(`${back()}<span class="eyebrow">Membership settings</span><h2 id="dialog-title">You’re in control.</h2><p>This is a working product preview. Puppy Helper replies are scripted, membership is simulated, and there is no live AI, sign-in or billing.</p><p>Profiles, uploaded photos, conversations and guides ${testing?'are temporary in this testing state':'are stored only in this browser on this device'}. They are not synced to an online account.</p><div class="action-row"><button class="text-link" data-action="membership">View membership</button></div>`);}
  function activate(){
    state.membership='active';state.inviteDismissed=false;
    puppy().history.forEach(c=>c.saved=true);persist();
    if(dialog.open)closePanel();
    // Unlock around the existing chat and composer without replacing either.
    renderConversation(false);$('#demo-state').value='active';
    $('.session-heading>p').textContent='Talk it through, try something, then come back with what happened.';
    $('.planner-lock-note')?.remove();$('#helper-question').focus();toast('Membership unlocked. Continue right here. No payment was made.');
  }
  function voice(){state.panel='voice';openPanel(`<span class="eyebrow">Voice input preview</span><h2 id="dialog-title">Talk it through.</h2><p>This demo shows how a voice transcript goes into your message. The microphone is not recording.</p><label class="sr-only" for="voice-transcript">Sample voice transcript</label><textarea id="voice-transcript" class="voice-input">${esc(state.draft||'I tried the plan yesterday. Here’s what happened…')}</textarea><div class="action-row">${gold('Use this text','use-voice')}</div>`);}
  async function readPhoto(file){
    if(!file)return '';
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>8*1024*1024){toast('Choose a JPG, PNG, WebP or GIF under 8 MB.');return '';}
    const url=URL.createObjectURL(file);
    try{const image=new Image();image.src=url;await image.decode();state.urls.add(url);state.photos.set(url,file);return url;}catch{URL.revokeObjectURL(url);toast('That image could not be opened. Choose another photo.');return '';}
  }
  function resetProfiles(mode){
    state.profileMode=mode;state.dogs=mode==='empty'?[]:window.RMPMemberData.samples(mode==='multiple');
    if(mode==='no-photo'){state.dogs[0]={id:'fido',name:'Fido',breed:'Bernedoodle',gender:'Male',sampleAge:'5 months',photo:'',sample:true,history:[],guides:[]};}
    state.active=state.dogs[0]?.id||'guest';state.current=puppy().history[0]||null;state.draft='';state.attachment='';guest.history=[];guest.guides=[];render();
  }
  function replyFor(question,d,c){
    // Scripted demonstration responses, not an AI endpoint. No text or photo leaves the browser.
    const previous=c?messages(c).filter(m=>m.role==='helper').length:0;
    if(previous){
      return {role:'helper',text:previous===1?'Keep that observation with this conversation. What was different this time: the timing, the setup, or how long it lasted?':'Let’s compare that with what you tried earlier. What improved, and what still needs adjusting?',steps:[[previous===1?'Change one thing at a time.':'Keep a short record of what changed.',previous===1?'Use the same setup for the next attempt and note what you changed, so you can compare the result.':'Add what you tried and how your puppy responded. Bring those details back here before changing the next part.']]};
    }
    const fixtures=window.RMPMemberData.samples()[0].history;
    const selected=/playpen|work from home|out of sight/i.test(question)?fixtures[0]:/tired|evening|wind.down/i.test(question)?fixtures[1]:null;
    if(selected){const rename=t=>t.replaceAll('Winnie',d.name||'your puppy');return {role:'helper',text:rename(selected.answer),steps:selected.steps.map(step=>step.map(rename)),type:selected.type};}
    return {role:'helper',text:`Let’s pin down the pattern${d.name?' with '+d.name:''}. What happened just before, what did your puppy do, and what changed afterward?`,steps:[['Start with one specific moment.','Note where you were, what your puppy could see, and what happened just before the behavior.'],['Look for a useful comparison.','Think of a time when the same situation went more smoothly. What was different?']]};
  }
  function sendMessage(question){
    const d=puppy();let c=state.current;
    const reply=replyFor(question,d,c);
    if(!c){c={id:crypto.randomUUID(),title:question.length>56?question.slice(0,53)+'…':question,question,type:reply.type||'custom',saved:member(),messages:[],prompt:'Want to pick up where we left off?',memory:`Last time, you asked: “${question.slice(0,100)}”. Tell me what happened since.`};d.history.unshift(c);state.current=c;}
    messages(c).push({role:'user',text:question,photo:state.attachment},reply);
    d.history=d.history.filter(x=>x.id!==c.id);d.history.unshift(c);
    state.draft='';state.attachment='';state.inviteDismissed=false;
    $('#helper-question').value='';$('#attachment-preview').innerHTML='';$('#composer-photo').value='';
    if(state.membership==='available')state.membership='used';
    persist();renderConversation(true,true);resizeComposer();
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
      if(birthdate&&new Date(birthdate+'T12:00:00')>new Date()){toast('Choose a birthdate that is today or earlier.');return;}
      const old=state.dogs.find(d=>d.id===form.dataset.id),wasGuest=puppy().id==='guest',previous=old||(wasGuest?guest:null);
      const d={id:old?.id||crypto.randomUUID(),name,breed,birthdate,gender:data.get('gender'),photo:form.photoURL||'',sample:false,history:previous?.history||[],guides:previous?.guides||[]};
      if(old)state.dogs[state.dogs.indexOf(old)]=d;else state.dogs.push(d);
      if(wasGuest){guest.history=[];guest.guides=[];}
      state.active=d.id;state.current=d.history.find(c=>c.id===state.current?.id)||d.history[0]||null;
      closePanel();render();persist();toast('Your puppy’s details are saved.');return;
    }
    if(event.target.id!=='helper-form')return;
    event.preventDefault();const question=state.draft.trim();if(!question)return;
    if(state.membership==='used'){membership();return;}
    sendMessage(question);
  });
  document.addEventListener('click',event=>{
    const toggle=event.target.closest('#puppy-toggle');
    if(toggle){const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));$('#puppy-menu').hidden=open;return;}
    if(!event.target.closest('.puppy-switch')&&$('#puppy-menu')){$('#puppy-menu').hidden=true;$('#puppy-toggle').setAttribute('aria-expanded','false');}
    const b=event.target.closest('[data-action],[data-puppy],[data-conversation],[data-edit],[data-guide]');if(!b)return;
    if(b.dataset.puppy){state.active=b.dataset.puppy;state.current=puppy().history[0]||null;state.draft='';state.attachment='';render();persist();$('#puppy-toggle').focus({preventScroll:true});return;}
    if(b.dataset.edit){editProfile(b.dataset.edit);return;}
    if(b.dataset.conversation){if(!member()){lockedFeature('Saved conversation history');return;}state.current=puppy().history.find(c=>c.id===b.dataset.conversation);if(dialog.open)closePanel();renderConversation(true);persist();return;}
    if(b.dataset.guide){if(!member()){lockedFeature('Saved guides');return;}state.guide=puppy().guides.find(g=>g.id===b.dataset.guide);guidePanel();return;}
    const action=b.dataset.action;
    const handlers={'ask-helper':()=>{$('#session-title').focus({preventScroll:true});$('#helper-session').scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});},account,profiles,history,guides,planner:plannerChoice,membership,settings,voice,'make-guide':makeGuide,'add-puppy':()=>editProfile(),'edit-active':()=>editProfile(puppy().id==='guest'?null:puppy().id),
      attach:()=>$('#composer-photo').click(),
      'remove-attachment':()=>{state.attachment='';$('#attachment-preview').innerHTML='';$('#composer-photo').value='';},
      'edition-color':()=>{state.edition='color';plannerView();},'edition-ink':()=>{state.edition='ink';plannerView();},'switch-edition':()=>{state.edition=state.edition==='ink'?'color':'ink';plannerView();},
      'save-conversation':()=>{if(!member()){membership();return;}state.current.saved=true;persist();renderRecent();toast('Conversation saved on this device.');},
      'new-question':()=>{state.current=null;state.draft='';state.attachment='';$('#attachment-preview').innerHTML='';$('#composer-photo').value='';renderConversation(false);persist();$('#helper-question').value='';$('#send-question').disabled=true;resizeComposer();$('#helper-question').focus();},
      'follow-up':()=>{$('#helper-question').focus();},
      'source-conversation':()=>{state.current=puppy().history.find(c=>c.id===state.guide.source);closePanel();renderConversation(true);persist();},
      'use-voice':()=>{state.draft=$('#voice-transcript').value.slice(0,3000);closePanel();$('#helper-question').value=state.draft;$('#send-question').disabled=!state.draft.trim()||state.membership==='used';resizeComposer();$('#helper-question').focus();},
      activate,'dismiss-invitation':()=>{state.inviteDismissed=true;$('#membership-invitation').innerHTML=invitation();persist();},'return-to-chat':()=>{closePanel();$('#helper-question').focus();},
      'preview-cancel':()=>{openPanel(`${back()}<span class="eyebrow">Cancellation preview</span><h2 id="dialog-title">Membership canceled.</h2><p>In the finished product, access would continue through the paid period. No real membership has changed in this demo.</p>`);},
      'print-guide':()=>printHTML(`<div class="print-sheet">${guidePaper(state.guide)}</div>`),
      'print-inline-guide':()=>{const g=puppy().guides.find(g=>g.source===state.current?.id);if(g)printHTML(`<div class="print-sheet">${guidePaper(g)}</div>`);},
      'go-page':()=>{const n=Math.max(1,Math.min(planner.editions[state.edition].count,Number($('#document-page').value)||1));$('#document-page').value=n;$('#document-page-'+n).scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});},
      'print-planner':()=>{toast('Preparing the complete planner for printing…');printHTML(planner.editions[state.edition].titles.map((_,i)=>`<div class="print-sheet"><img src="${planner.image(state.edition,i)}" alt="Planner page ${i+1}"></div>`).join(''));}};
    handlers[action]?.();
  });
  document.addEventListener('input',event=>{
    if(event.target.id==='helper-question'){state.draft=event.target.value;$('#send-question').disabled=!state.draft.trim()||state.membership==='used';resizeComposer();}
    if(event.target.matches('[data-guide-notes]')){const g=puppy().guides.find(g=>g.id===event.target.closest('[data-guide-id]').dataset.guideId);if(g){g.notes=event.target.value;persist();}}
  });
  document.addEventListener('change',async event=>{
    const el=event.target;
    if(el.id==='demo-state'){if(dialog.open)closePanel();state.membership=el.value;state.draft='';state.attachment='';state.inviteDismissed=false;render();}
    else if(el.id==='demo-profile'){if(dialog.open)closePanel();resetProfiles(el.value);}
    else if(el.dataset.guideCheck!==undefined){const g=puppy().guides.find(g=>g.id===el.closest('[data-guide-id]').dataset.guideId);if(g){g.checks[Number(el.dataset.guideCheck)]=el.checked;persist();}}
    else if(el.type==='file'){
      const form=el.closest('form'),file=el.files[0];
      const url=await readPhoto(file);if(!url||!el.isConnected)return;
      if(el.id==='composer-photo'){state.attachment=url;$('#attachment-preview').innerHTML=attachmentHTML();}
      else{form.photoURL=url;$('#profile-photo-preview',form).innerHTML=`<img src="${esc(url)}" alt="New puppy profile photo"><span>Ready to take center stage.</span>`;}
    }
  });
  document.addEventListener('keydown',event=>{
    if(event.target.id==='document-page'&&event.key==='Enter'){event.preventDefault();$('[data-action="go-page"]').click();}
    if(event.key==='Escape'&&!dialog.open&&$('#puppy-menu')&&!$('#puppy-menu').hidden){$('#puppy-menu').hidden=true;$('#puppy-toggle').setAttribute('aria-expanded','false');$('#puppy-toggle').focus();}
    if(event.target.id==='helper-question'&&event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();$('#helper-form').requestSubmit();}
  });
  $('.dialog-close').addEventListener('click',closePanel);
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closePanel();}});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let motionFrame=0;
  function updateMotion(){const photo=$('.hero-photo');if(!photo)return;if(reduced.matches||innerWidth<=760||photo.closest('.is-upload')){photo.style.transform='none';return;}const y=Math.min(24,scrollY*.04);photo.style.transform=`translateY(${y}px) scale(1.065)`;}
  window.addEventListener('scroll',()=>{if(motionFrame||reduced.matches)return;motionFrame=requestAnimationFrame(()=>{updateMotion();motionFrame=0;});},{passive:true});
  window.addEventListener('resize',updateMotion);reduced.addEventListener('change',updateMotion);
  // Object URLs stay valid when this page is restored from the browser's back/forward cache.
  // The browser releases them when the document is discarded.
  async function initialize(){
    $('#demo-controls').hidden=!testing;
    if(testing){
      if(previewMode==='returning'){state.membership='active';resetProfiles('multiple');return;}
      state.membership=previewMode==='subscribed'?'active':'available';
      if(previewMode==='used'||previewMode==='subscribed'){
        const question='My puppy barks in the playpen while I work from home.';
        const reply=replyFor(question,guest,null);
        const c={id:'preview-first',title:'Settling while I work',question,type:'work',saved:member(),messages:[{role:'user',text:question},reply]};
        guest.history=[c];state.current=c;if(previewMode==='used')state.membership='used';
      }
    }else await restoreMember();
    render();if(state.storageUnavailable)toast('Browser storage is unavailable. Your changes will last while this page is open.');
  }
  initialize();
})();
