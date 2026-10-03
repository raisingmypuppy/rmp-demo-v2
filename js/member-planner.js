/* Dedicated low-ink layouts. No filtering or grayscale transformation of color pages. */
window.RMPMemberPlanner = (() => {
  const pages = [
    ['Potty Training Roadmap','potty-training-roadmap.png'],
    ['Weekly Puppy Routine Tracker','weekly-puppy-routine-tracker.png'],
    ['Puppy-Proofing Checklist','puppy-proofing-checklist.png'],
    ['Your Puppy’s First Week','your-puppys-first-week.png'],
    ['People & Handling','people-and-handling.png'],
    ['Training Log','training-log.png']
  ];
  const table=(heads,rows,cls='')=>`<table class="${cls}"><thead><tr>${heads.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map((v,i)=>i===0?`<th scope="row">${v}</th>`:`<td>${v||' '}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
  const list=items=>`<ul class="print-list">${items.map(x=>`<li>${x}</li>`).join('')}</ul>`;
  function lowInk(index) {
    let content='',subtitle='';
    switch(index){
      case 0: subtitle='Plan the routine. Record what helps your puppy succeed.';content=table(['When','Our plan','What happened'],['After waking','After meals','After play','Before resting','Before bedtime','Overnight'].map(x=>[x,'','']));break;
      case 1: subtitle='Track your puppy’s daily rhythm. Check off or write notes for each day.';content=table(['','Mon','Tue','Wed','Thu','Fri','Sat','Sun'],['Wake time','Meals','Potty breaks','Naps','Training','Walk & play','Bedtime'].map(x=>[x,'','','','','','','']),'tracker');break;
      case 2: subtitle='Get down to puppy height. Check each space before giving access.';content=list(['Move cords and chargers out of reach.','Secure cleaning products, medicine and household chemicals.','Put shoes, laundry and small objects away.','Check plants and remove unsafe ones from puppy areas.','Secure trash, food and pantry access.','Check gates, doors, fences and escape gaps.','Choose a safe place for quiet rest.','Walk through each room again as your puppy grows.']);break;
      case 3: subtitle='Keep the first week simple. Notice what helps your puppy feel settled.';content=table(['Day','Routine / what we tried','What helped'],Array.from({length:7},(_,i)=>[`${i+1}`,'','']));break;
      case 4: subtitle='Keep experiences brief and comfortable. Give your puppy a choice to pause.';content=table(['Experience','Date','Puppy’s response / next step'],['A new person','Gentle paw touch','Collar or harness','Ears and face','Brushing','A quiet visitor'].map(x=>[x,'','']));break;
      case 5: subtitle='One small skill at a time. Record the setup as well as the result.';content=table(['Date','Skill / setup','What happened','Next small step'],Array.from({length:7},()=>['','','','']));break;
    }
    return `<article class="low-ink-page" aria-label="${pages[index][0]}, printer-friendly sample"><div class="print-brand">RAISING MY PUPPY · PUPPY PLANNER</div><h3>${pages[index][0]}</h3><p class="print-sub">${subtitle}</p><div class="print-fill">Puppy: ____________________ &nbsp; Week of: ______________</div>${content}<div class="print-notes">Notes / what to try next:</div><footer><span>Raising My Puppy</span><span>Printer-friendly · Sample ${index+1} of 6</span></footer></article>`;
  }
  function page(index,edition){return edition==='ink'?lowInk(index):`<img src="assets/planner/${pages[index][1]}" alt="${pages[index][0]}, full-color sample">`;}
  return {pages,lowInk,page};
})();
