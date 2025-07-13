// Quick Linear API test
const query = `
  query {
    teams {
      nodes {
        id
        name
        key
        description
      }
    }
  }
`;

async function testLinear() {
  try {
    console.log('Testing Linear API...');
    
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'lin_api_Wrvi5zIDQynIjiWxlJoglBBqIuN8SK81NHpSB2Xa',
      },
      body: JSON.stringify({ query }),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));

    if (data.data && data.data.teams) {
      console.log('\nTeams found:');
      data.data.teams.nodes.forEach((team: any) => {
        console.log(`- ${team.name} (${team.key}): ${team.id}`);
        if (team.key === 'PER') {
          console.log('  ⭐ This is your PER team!');
        }
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

testLinear();