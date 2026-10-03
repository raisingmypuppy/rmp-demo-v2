/* Static fixtures only. Each puppy owns its conversations and guides. */
window.RMPMemberData = (() => {
  const work = {
    id:'w-work', title:'Settling while I work', subtitle:'Pick up where you left off', type:'work',
    question:'Winnie is my 5-month-old female Bernedoodle and I work from home. If I put her in the playpen where she can see me, she barks and loses her mind. Weirdly, if I leave the room, she settles faster. What am I doing wrong?',
    answer:'Seeing you but not being able to reach you may actually be harder for Winnie than having you out of sight. Since she settles faster when you leave the room, use that as your starting point.',
    steps:[['Use short out-of-sight work blocks first.','Start where Winnie settles faster. Keep the first block brief and return while she is still calm.'],['Give her something specific to do when you leave.','Offer a familiar stuffed toy or quiet activity before stepping away.'],['Practice seeing you separately.','Try a few calm seconds with you in view. End before barking starts, then increase gradually.']],
    prompt:'Still having trouble with the playpen?', memory:'Last time, Winnie settled faster with you out of sight. Tell me what happened since.', saved:true, sample:true
  };
  const tired = {
    id:'w-tired',title:'Why she gets wild when tired',subtitle:'Your conversation, saved.',type:'tired',
    question:'Winnie gets bitey and races around the room in the evening, even after a busy day. More play seems to make it worse. What should I try?',
    answer:'The pattern is useful: more activity is winding Winnie up instead of helping her settle. Try a quieter end to the day and look at how long she has been awake.',
    steps:[['Start winding down earlier.','Note when the biting starts and begin a quieter routine before that point.'],['Make the next activity predictable.','Offer a potty break, then a quiet place to rest with fewer distractions.'],['Track the pattern.','Record awake time and what helped her settle, so you can adjust the next evening.']],
    prompt:'Did the quieter evening help?',memory:'You were trying an earlier wind-down with Winnie. How did last night go?',saved:true,sample:true
  };
  const second = {
    id:'m-night',title:'That 5 a.m. wake-up call',subtitle:'Pick up where you left off',type:'night',
    question:'Milo wakes me at 5 a.m. He goes outside, then wants the day to start. How do I keep that early break quiet?',
    answer:'Separate the early outside break from the start of the day. Keep the trip quiet and predictable, then give Milo a chance to settle again.',
    steps:[['Keep the trip brief.','Use the same outside spot and a quiet voice.'],['Return to the resting routine.','Keep the room dim and activity low after the break.'],['Write down the timing.','Record the wake-up and whether Milo settled again. Look for a pattern over several mornings.']],
    prompt:'How did last night go?',memory:'Milo had you up at 5 a.m. Did the quiet return to bed make any difference?',saved:true,sample:true
  };
  function samples(multiple=false) {
    const dogs=[{id:'winnie',name:'Winnie',breed:'Bernedoodle',gender:'Female',sampleAge:'5 months',birthdate:'',photo:'assets/images/winnie-hero.png',sample:true,history:structuredClone([work,tired]),guides:[]}];
    // Milo has no supplied photo. Winnie is explicitly a stand-in, never Milo's image.
    if(multiple) dogs.push({id:'milo',name:'Milo',breed:'Dachshund',gender:'Male',sampleAge:'4 months',birthdate:'',photo:'',sample:true,history:structuredClone([second]),guides:[]});
    return dogs;
  }
  return {samples};
})();
