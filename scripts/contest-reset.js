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

async function runContestReset() {
  console.log("Starting Weekly Splat Contest Reset...");

  // 1. Fetch all bad beat posts
  const { data: posts, error: fetchError } = await supabase
    .from('mb_wall_posts')
    .select('*')
    .eq('is_bad_beat', true);

  if (fetchError) {
    console.error("Error fetching posts:", fetchError);
    process.exit(1);
  }

  if (!posts || posts.length === 0) {
    console.log("No bad beat posts found for this week's contest.");
    process.exit(0);
  }

  // 2. Score each post and find the winner
  let winner = null;
  let maxScore = -1;

  for (const post of posts) {
    // Parse suffer count
    const sufferParts = post.message.split('|||suffer|||');
    const baseWithSplats = sufferParts[0];
    const sufferCount = sufferParts[1] ? parseInt(sufferParts[1], 10) || 0 : 0;

    // Parse splat count
    const splatParts = baseWithSplats.split('|||splats|||');
    const baseMessageStr = splatParts[0];
    const splatCount = splatParts[1] ? parseInt(splatParts[1], 10) || 0 : 0;

    // Parse comments
    const messageParts = baseMessageStr.split('|||comment|||');
    const mainMessage = messageParts[0];
    const commentsCount = messageParts.length - 1;

    // Total score is the sum of splats, suffer reactions, and comments
    const totalScore = splatCount + sufferCount + commentsCount;

    console.log(`Post by ${post.author}: Splats=${splatCount}, Suffer=${sufferCount}, Comments=${commentsCount}, Total Score=${totalScore}`);

    if (totalScore > maxScore) {
      maxScore = totalScore;
      winner = {
        id: post.id,
        author: post.author,
        message: mainMessage,
        splatCount,
        sufferCount,
        commentsCount,
        score: totalScore,
        created_at: post.created_at
      };
    }
  }

  // 3. Save winner details to public weekly-winner JSON file
  if (winner && maxScore > 0) {
    console.log(`Winner identified! ${winner.author} with a score of ${winner.score}`);
    
    const dataDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const winnerPath = path.join(dataDir, 'weekly-winner.json');
    fs.writeFileSync(winnerPath, JSON.stringify(winner, null, 2));
    console.log(`Saved weekly winner to ${winnerPath}`);
  } else {
    console.log("No winning post with an active score found.");
  }

  // 4. Delete all bad beat posts under the section
  console.log("Resetting contest: Deleting bad beat posts...");
  const { error: deleteError } = await supabase
    .from('mb_wall_posts')
    .delete()
    .eq('is_bad_beat', true);

  if (deleteError) {
    console.error("Error resetting bad beat posts:", deleteError);
    process.exit(1);
  }

  console.log("Contest reset completed successfully!");
}

runContestReset().catch(err => {
  console.error(err);
  process.exit(1);
});