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

const PLAYERS = [
  "Tony",
  "2up",
  "Loucifer",
  "Diesel",
  "Dragon queen",
  "Boxman",
  "Singram",
  "Cee Brooklyn",
  "Chickadee",
  "Ahab",
  "Scar",
  "Bluffa",
  "Ramhero",
  "Bluffnbaddie",
  "Aprob",
  "Mama"
];

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

async function main() {
  const shuffled = shuffle([...PLAYERS]);
  
  const matches = [];
  // Round 1 (8 matches) - omit winner property to save characters
  for (let i = 0; i < 8; i++) {
    matches.push({
      p1: shuffled[i * 2],
      p2: shuffled[i * 2 + 1]
    });
  }
  // Round 2, 3, 4 (7 matches) - completely empty objects to save characters
  for (let i = 0; i < 7; i++) {
    matches.push({});
  }

  const stateJson = JSON.stringify(matches);
  console.log('JSON Length:', stateJson.length);
  console.log('JSON State:', stateJson);

  // Check if bracket_state already exists
  const { data: existing, error: findError } = await supabase
    .from('mb_wall_posts')
    .select('id')
    .eq('author', 'bracket_state')
    .maybeSingle();

  if (findError) {
    console.error('Find error:', findError);
    return;
  }

  let result;
  if (existing) {
    result = await supabase
      .from('mb_wall_posts')
      .update({ message: stateJson })
      .eq('id', existing.id);
  } else {
    result = await supabase
      .from('mb_wall_posts')
      .insert({
        author: 'bracket_state',
        message: stateJson,
        font_color: '#f4c430',
        bg_color: '#0a3d1f',
        font_family: 'mono',
        rotation: 0,
        is_bad_beat: false
      });
  }

  if (result.error) {
    console.error('Save error:', result.error);
    return;
  }

  console.log('\nSUCCESSFULLY GENERATED AND PERSISTED NEW SHUFFLED ROUND 1 MATCHES:');
  for (let i = 0; i < 8; i++) {
    console.log(`Table ${i+1}: ${matches[i].p1} vs ${matches[i].p2}`);
  }
}

main();
