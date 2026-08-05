const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('/home/ubuntu/.openclaw/workspace/monkey-business/.env.local', 'utf8');
const lines = envFile.split('\n');
let url = '';
let service = '';

for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    url = line.split('=')[1].replace(/"/g, '').trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    service = line.split('=')[1].replace(/"/g, '').trim();
  }
}

const supabase = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  // Fetch draft_bracket_state
  const { data, error } = await supabase
    .from('mb_wall_posts')
    .select('id, message')
    .eq('author', 'draft_bracket_state')
    .maybeSingle();

  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  let stateJson = '';
  if (data && data.message) {
    stateJson = data.message;
  } else {
    console.log('No draft_bracket_state found.');
    return;
  }

  console.log('Original JSON:', stateJson);
  let matches = JSON.parse(stateJson);

  // Swap Singram and Diesel in p1 or p2 of any match
  matches = matches.map(match => {
    let p1 = match.p1;
    let p2 = match.p2;
    let winner = match.winner;

    if (p1 === 'Singram') p1 = 'Diesel';
    else if (p1 === 'Diesel') p1 = 'Singram';

    if (p2 === 'Singram') p2 = 'Diesel';
    else if (p2 === 'Diesel') p2 = 'Singram';

    if (winner === 'Singram') winner = 'Diesel';
    else if (winner === 'Diesel') winner = 'Singram';

    const newMatch = {};
    if (p1 !== undefined) newMatch.p1 = p1;
    if (p2 !== undefined) newMatch.p2 = p2;
    if (winner !== undefined) newMatch.winner = winner;

    return newMatch;
  });

  const updatedJson = JSON.stringify(matches);
  console.log('Swapped JSON:', updatedJson);

  // Update draft_bracket_state
  const { error: updateDraftError } = await supabase
    .from('mb_wall_posts')
    .update({ message: updatedJson })
    .eq('id', data.id);

  if (updateDraftError) {
    console.error('Error updating draft_bracket_state:', updateDraftError);
  } else {
    console.log('Successfully updated draft_bracket_state!');
  }

  // Update or Insert bracket_state
  const { data: existingPub, error: findPubError } = await supabase
    .from('mb_wall_posts')
    .select('id')
    .eq('author', 'bracket_state')
    .maybeSingle();

  if (!findPubError) {
    if (existingPub) {
      const { error: updatePubError } = await supabase
        .from('mb_wall_posts')
        .update({ message: updatedJson })
        .eq('id', existingPub.id);
      if (updatePubError) console.error('Error updating bracket_state:', updatePubError);
      else console.log('Successfully updated existing bracket_state!');
    } else {
      const { error: insertPubError } = await supabase
        .from('mb_wall_posts')
        .insert({
          author: 'bracket_state',
          message: updatedJson,
          font_color: '#f4c430',
          bg_color: '#0a3d1f',
          font_family: 'mono',
          rotation: 0,
          is_bad_beat: false
        });
      if (insertPubError) console.error('Error inserting bracket_state:', insertPubError);
      else console.log('Successfully created and saved bracket_state!');
    }
  }
}

main();
