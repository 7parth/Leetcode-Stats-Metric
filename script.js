document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.getElementById("search-btn");
  const usernameInput = document.getElementById("user-input");
  const statsContainer = document.querySelector(".stats-container");
  const easyProgressCircle = document.querySelector(".easy-progress");
  const mediumProgressCircle = document.querySelector(".medium-progress");
  const hardProgressCircle = document.querySelector(".hard-progress");
  const easyLabel = document.getElementById("easy-level");
  const mediumLabel = document.getElementById("medium-level");
  const hardLabel = document.getElementById("hard-level");
  const cardStatsContainer = document.querySelector(".stats-card");

  //Creating A function which validates username based on regularexpression
  function validateUsername(username) {
    if (username === "") {
      alert("Username Should Not Be Empty");
      return false;
    }

    const Regex = /^[a-zA-Z0-9](?!.*--)[a-zA-Z0-9_-]{0,14}[a-zA-Z0-9]$/;

    const isMatching = Regex.test(username);
    if (!isMatching) {
      alert("Invalid Username");
    }
    return isMatching;
  }

  async function fetchUserDetails(username) {
    try {
      searchButton.textContent = "Searching ... ";
      searchButton.disabled = true;
      // const response = await fetch(url);
      const proxyUrl = "https://cors-anywhere.herokuapp.com/";
      const targetUrl = "https://leetcode.com/graphql/";
      const myHeaders = new Headers();
      myHeaders.append("content-type", "application/json");

      const graphql = JSON.stringify({
        query:
          "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
        variables: { username: `${username}` },
      });

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
      };
      const response = await fetch(proxyUrl + targetUrl, requestOptions);

      if (!response.ok) {
        throw new Error("Unable to fetch user details");
      }
      const Parseddata = await response.json();

      console.log("Logging Data ... ", Parseddata);

      displayUserData(Parseddata);
    } catch (error) {
      statsContainer.innerHTML = `<p>${error.message}</p>`;
    } finally {
      searchButton.textContent = "Search";
      searchButton.disabled = false;
    }
  }

  function displayUserData(Parseddata) {
    const totalQuesCound = Parseddata.data.allQuestionsCount[0].count;
    const totalEasyQuesCound = Parseddata.data.allQuestionsCount[1].count;
    const totalMediumQuesCound = Parseddata.data.allQuestionsCount[2].count;
    const totalHardQuesCound = Parseddata.data.allQuestionsCount[3].count;

    const solvedTotalQuestions =
      Parseddata.data.matchedUser.submitStats.acSubmissionNum[0].count;
    const solvedEasyQuestions =
      Parseddata.data.matchedUser.submitStats.acSubmissionNum[1].count;
    const solvedMediumQuestions =
      Parseddata.data.matchedUser.submitStats.acSubmissionNum[2].count;
    const solvedHardQuestions =
      Parseddata.data.matchedUser.submitStats.acSubmissionNum[3].count;

    updateProgress(
      solvedEasyQuestions,
      totalEasyQuesCound,
      easyLabel,
      easyProgressCircle
    );
    updateProgress(
      solvedMediumQuestions,
      totalMediumQuesCound,
      mediumLabel,
      mediumProgressCircle
    );
    updateProgress(
      solvedHardQuestions,
      totalHardQuesCound,
      hardLabel,
      hardProgressCircle
    );

    const cardsData = [
      {
        label: "Overall Submissions",
        value:
          Parseddata.data.matchedUser.submitStats.totalSubmissionNum[0]
            .submissions,
      },
      {
        label: "Overall Easy Submissions",
        value:
          Parseddata.data.matchedUser.submitStats.totalSubmissionNum[1]
            .submissions,
      },
      {
        label: "Overall Medium Submissions",
        value:
          Parseddata.data.matchedUser.submitStats.totalSubmissionNum[2]
            .submissions,
      },
      {
        label: "Overall Hard Submissions",
        value:
          Parseddata.data.matchedUser.submitStats.totalSubmissionNum[3]
            .submissions,
      },
    ];

    console.log("Cards Data ...", cardsData);

    cardStatsContainer.innerHTML = cardsData
      .map(
        (data) =>
          `<div class = "card">
                    <h5>${data.label}</h5>
                    <p>${data.value}</p>
                </div>`
      )
      .join("");
  }

  function updateProgress(solved, total, label, circle) {
    const progressDegree = (solved / total) * 100;
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    label.textContent = `${solved}/${total}`;

    let currentDegree = 0;
    const step = progressDegree / 100; 

    const interval = setInterval(() => {
      currentDegree += step;
      circle.style.setProperty("--progress-degree", `${currentDegree}%`);
      if (currentDegree >= progressDegree) {
        clearInterval(interval);
      }
    }, 10);
  }


  searchButton.addEventListener("click", () => {
    const username = usernameInput.value;
    console.log("Logging username ....", username);
    if (validateUsername(username)) {
      fetchUserDetails(username);
    }
  });
});
