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
    // Parse ice count first
    const iceParts = post.message.split('|||ice|||');
    const baseWithSuffer = iceParts[0];
    const iceCount = iceParts[1] ? parseInt(iceParts[1], 10) || 0 : 0;

    // Parse suffer count
    const sufferParts = baseWithSuffer.split('|||suffer|||');
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

    // Sum up the 5 tiers of banana ratings left on the card
    const ratingsCount = (post.banana_1 || 0) + (post.banana_2 || 0) + (post.banana_3 || 0) + (post.banana_4 || 0) + (post.banana_5 || 0);

    // Total score is calculated from the actual banana ratings (direct 1 to 10 ratings)
    const totalScore = ratingsCount;

    console.log(`Post by ${post.author}: Splats=${splatCount}, Suffer=${sufferCount}, Ice=${iceCount}, Comments=${commentsCount}, Ratings=${ratingsCount}, Total Score=${totalScore}`);

    if (totalScore > maxScore) {
      maxScore = totalScore;
      winner = {
        id: post.id,
        author: post.author,
        message: mainMessage,
        splatCount,
        sufferCount,
        iceCount,
        commentsCount,
        ratingsCount,
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

    // 3b. Insert Announcement Post to the General Wall!
    try {
      console.log("Inserting Weekly Champion announcement to General Wall...");
      const announcementText = `🏆 WEEKLY BAD BEAT CHAMPION: Congrats to ${winner.author} for winning the river-splat crown with ${winner.score} points! 🍌\n\nTheir legendary beat: "${winner.message}"`;
      
      const { error: announceError } = await supabase
        .from('mb_wall_posts')
        .insert({
          author: "Astra 👑",
          message: announcementText,
          font_color: "#f4c430", // banana yellow
          bg_color: "#0a1f3d", // felt
          font_family: "display",
          rotation: 0,
          is_bad_beat: false // general wall
        });

      if (announceError) {
        console.error("Failed to insert wall announcement:", announceError);
      } else {
        console.log("Wall announcement inserted successfully!");
      }
    } catch (announceErr) {
      console.error("Error inserting announcement:", announceErr);
    }
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

  // 5. Commit, Push and Redeploy to Vercel so the live site updates!
  try {
    const { execSync } = require('child_process');
    console.log("Git adding and committing new weekly-winner.json...");
    execSync('git add public/data/weekly-winner.json', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    execSync('git commit -m "chore: update weekly bad beat winner [auto]"', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    execSync('git push', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log("Successfully pushed to GitHub!");

    console.log("Deploying updated winner to Vercel...");
    execSync('vercel --prod --token 4nVrxOV0Z9l8FIW9SALGauGt --yes', { cwd: path.join(__dirname, '..'), stdio: 'inherit' });
    console.log("Vercel deployment completed successfully!");
  } catch (deployError) {
    console.error("Error during Git/Vercel deployment:", deployError);
  }

  console.log("Contest reset completed successfully!");
}

runContestReset().catch(err => {
  console.error(err);
  process.exit(1);
});