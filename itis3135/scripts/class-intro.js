/*! class-intro.js | M14: fetches the class introductions from the shared API
    (https://intro-form.tommyhost.ing/) and renders a spotlight on the newest
    submission, a roster of every classmate, and a small stats strip. */

document.addEventListener("DOMContentLoaded", function () {
    const API_URL = "https://intro-form.tommyhost.ing/";
    const spotlight = document.getElementById("spotlight");
    const roster = document.getElementById("roster");
    const stats = document.getElementById("stats");

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) {
            node.className = className;
        }
        if (text !== undefined) {
            node.textContent = text;
        }
        return node;
    }

    /* Safe getters: classmate entries vary, so every field can be blank. */
    function nameOf(record) {
        const data = record.introductionData || {};
        const nick = data.nickname ? '"' + data.nickname.replace(/"/g, "") + '" ' : "";
        return (data.firstName || record.username || "A classmate") + " " +
            (data.middleName || "") + " " + nick + (data.lastName || "");
    }

    function mascotOf(record) {
        const data = record.introductionData || {};
        const adjective = data.adjectives || "";
        const animal = data.animal || "";
        return (adjective + " " + animal).trim();
    }

    function quoteOf(record) {
        const data = record.introductionData || {};
        return { text: data.quote || "", author: data.quoteAuthor || "" };
    }

    function imgOf(record) {
        const data = record.introductionData || {};
        return data.img || "";
    }

    function rosterCard(record) {
        const card = el("article", "roster-card");
        const mascot = mascotOf(record);
        const quote = quoteOf(record);
        const img = document.createElement("img");
        img.src = imgOf(record);
        img.alt = record.introductionData && record.introductionData.caption
            ? record.introductionData.caption
            : "Photo of " + nameOf(record);
        card.appendChild(img);
        /* the name doubles as the article's heading (h4 under the section h3) */
        card.appendChild(el("h4", null, nameOf(record)));
        if (mascot) {
            card.appendChild(el("p", null, mascot));
        }
        if (quote.text) {
            const line = el("p");
            const said = el("em", null, "“" + quote.text + "”");
            line.appendChild(said);
            if (quote.author) {
                line.appendChild(document.createTextNode(" — " + quote.author));
            }
            card.appendChild(line);
        }
        return card;
    }

    function newestOf(all) {
        let newest = null;
        let newestTime = "";
        for (const username in all) {
            const record = all[username];
            if (newest === null || record.lastUpdated > newestTime) {
                newest = record;
                newestTime = record.lastUpdated;
            }
        }
        return newest;
    }

    function animalCounts(all) {
        const counts = {};
        for (const username in all) {
            const animal = (all[username].introductionData || {}).animal;
            if (animal) {
                counts[animal] = (counts[animal] || 0) + 1;
            }
        }
        return counts;
    }

    function buildSpotlight(record) {
        const mascot = mascotOf(record);
        const quote = quoteOf(record);
        const img = document.createElement("img");
        img.src = imgOf(record);
        img.alt = record.introductionData && record.introductionData.caption
            ? record.introductionData.caption
            : "Photo of " + nameOf(record);
        /* the article's static h4 becomes the submitter's name (article heading rule) */
        document.getElementById("spotlight-heading").textContent = nameOf(record);
        spotlight.appendChild(img);
        if (mascot) {
            spotlight.appendChild(el("p", null, mascot));
        }
        if (quote.text) {
            const said = document.createElement("blockquote");
            said.appendChild(el("p", null, "“" + quote.text + "”"));
            said.appendChild(el("cite", null, "- " + (quote.author || "unknown")));
            spotlight.appendChild(said);
        }
        if (record.lastUpdated) {
            spotlight.appendChild(el("p", null,
                "Submitted " + record.lastUpdated.slice(0, 10)));
        }
    }

    function buildStats(all, newest) {
        const entries = Object.keys(all).length;
        const items = [];
        items.push(entries + (entries === 1 ? " introduction" : " introductions") + " collected");
        if (newest && newest.lastUpdated) {
            items.push("Newest submission " + newest.lastUpdated.slice(0, 10));
        }
        const counts = animalCounts(all);
        let topAnimal = "";
        let topCount = 0;
        for (const animal in counts) {
            if (counts[animal] > topCount) {
                topAnimal = animal;
                topCount = counts[animal];
            }
        }
        if (topAnimal) {
            items.push("Most common mascot animal: " + topAnimal);
        }
        items.forEach(function (item) {
            stats.appendChild(el("li", null, item));
        });
    }

    function showError() {
        const note = el("p", "load-error",
            "The class server is not answering right now. Try again later - " +
            "everyone's introductions live at " + API_URL);
        spotlight.appendChild(note);
    }

    fetch(API_URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (all) {
            const sorted = Object.keys(all).map(function (username) {
                return all[username];
            }).sort(function (a, b) {
                const nameA = (a.introductionData || {}).lastName || a.username;
                const nameB = (b.introductionData || {}).lastName || b.username;
                return nameA.localeCompare(nameB);
            });
            sorted.forEach(function (record) {
                roster.appendChild(rosterCard(record));
            });
            const newest = newestOf(all);
            if (newest) {
                buildSpotlight(newest);
            }
            buildStats(all, newest);
        })
        .catch(function () {
            showError();
        });
});
