const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach((line) => {
  const match = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[match[1]] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetAllVotes() {
  console.log("Starting full vote and comment reset for all posts...");

  // 1. Fetch all posts
  const { data: posts, error: fetchError } = await supabase
    .from('mb_wall_posts')
    .select('*');

  if (fetchError) {
    console.error("Error fetching posts:", fetchError);
    process.exit(1);
  }

  console.log(`Found ${posts.length} total posts. Clearing all stats...`);

  // 2. Clear stats on each post
  for (const post of posts) {
    // Extract base message (before comments, splats, suffers, or ice)
    const baseMessage = post.message.split('|||')[0];

    const { error: updateError } = await supabase
      .from('mb_wall_posts')
      .update({
        message: baseMessage,
        banana_1: 0,
        banana_2: 0,
        banana_3: 0,
        banana_4: 0,
        banana_5: 0,
        banana_count: 0
      })
      .eq('id', post.id);

    if (updateError) {
      console.error(`Error updating post ${post.id}:`, updateError);
    } else {
      console.log(`Reset post by ${post.author}`);
    }
  }

  // 3. Clear the weekly-winner.json if it exists
  const winnerPath = path.join(__dirname, '../public/data/weekly-winner.json');
  if (fs.existsSync(winnerPath)) {
    fs.unlinkSync(winnerPath);
    console.log("Removed old weekly-winner.json file.");
  }

  console.log("Full reset completed! Database is now a 100% clean slate.");
}

resetAllVotes().catch(err => {
  console.error(err);
  process.exit(1);
});