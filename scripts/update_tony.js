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
  // 1. Update bracket_state
  const { data: existing, error: findError } = await supabase
    .from('mb_wall_posts')
    .select('id, message')
    .eq('author', 'bracket_state')
    .maybeSingle();

  if (findError) {
    console.error('Find error:', findError);
    return;
  }

  if (existing && existing.message) {
    let stateJson = existing.message;
    console.log('Original State:', stateJson);
    // Replace "Tony" with "Smokey 420"
    stateJson = stateJson.replace(/"Tony"/g, '"Smokey 420"');
    console.log('Updated State:', stateJson);

    const { error: updateError } = await supabase
      .from('mb_wall_posts')
      .update({ message: stateJson })
      .eq('id', existing.id);

    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('Successfully updated bracket_state in Supabase!');
    }
  }

  // 2. Also update draft_bracket_state just in case it exists
  const { data: existingDraft, error: findDraftError } = await supabase
    .from('mb_wall_posts')
    .select('id, message')
    .eq('author', 'draft_bracket_state')
    .maybeSingle();

  if (!findDraftError && existingDraft && existingDraft.message) {
    let draftJson = existingDraft.message;
    draftJson = draftJson.replace(/"Tony"/g, '"Smokey 420"');
    await supabase
      .from('mb_wall_posts')
      .update({ message: draftJson })
      .eq('id', existingDraft.id);
    console.log('Successfully updated draft_bracket_state in Supabase!');
  }
}

main();
