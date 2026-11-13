/*! introduction.js | builds an introduction page out of introduction_form.html
    Part 1: collects data and swaps the form for the rebuilt page on submit.
    Part 2 (M13): Generate HTML/JSON/XML buttons emit raw code textareas.
    The JSON follows the introductionData schema the class API accepts. */

/* Uploaded image data URL; null means use the default course picture. */
let uploadedImage = null;

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("intro-form");
    const main = document.querySelector("main");
    const outputArea = document.getElementById("gen-output");
    const picInput = document.getElementById("picupload");
    const picPreview = document.getElementById("pic-preview");
    const DEFAULT_PICTURE = "images/intro.webp";
    /* Absolute URL for the class API and any app consuming introductionData. */
    const PUBLIC_PICTURE = "https://webpages.charlotte.edu/ddorazio/itis3135/images/intro.webp";
    let courseCount = form.querySelectorAll(".course-row").length;

    /* --- helpers, used by everything below --- */

    function esc(text) {
        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function field(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : "";
    }

    function renumber(row, n) {
        row.querySelectorAll("input, textarea, label").forEach(function (el) {
            if (el.htmlFor) {
                el.htmlFor = el.htmlFor.replace(/-\d+$/, "-" + n);
            }
            if (el.id) {
                el.id = el.id.replace(/-\d+$/, "-" + n);
            }
        });
    }

    /* --- data model shared by the submit swap and the M13 serializers --- */

    /* The display-name line, per introduction.html: First M. "Nick" Last ~ Adjective Animal */
    function displayName() {
        const parts = [field("fname"), field("mname")];
        const nick = field("nname");
        if (nick) {
            parts.push('"' + nick + '"');
        }
        parts.push(field("lname"));
        return parts.filter(Boolean).join(" ") + " " + field("divider") + " " +
            field("madj") + " " + field("manimal");
    }

    function pictureSrc() {
        return uploadedImage ? uploadedImage : DEFAULT_PICTURE;
    }

    function jsonImgSrc() {
        return uploadedImage ? uploadedImage : PUBLIC_PICTURE;
    }

    /* The sign-off reads "-DCD 08/25/26"; the schema wants just the date part. */
    function acknowledgmentDate() {
        const signoff = field("signoff");
        const parts = signoff.split(/\s+/);
        return parts.length > 1 ? parts[parts.length - 1] : "";
    }

    function bullet(label, id, override) {
        const content = esc(override !== undefined ? override : field(id));
        return '<li><strong>' + label + '</strong>\n' + content + '</li>';
    }

    function courseBullet() {
        const items = [];
        form.querySelectorAll(".course-row").forEach(function (row) {
            const dept = row.querySelector('input[name="c-dept"]').value.trim();
            const num = row.querySelector('input[name="c-num"]').value.trim();
            const name = row.querySelector('input[name="c-name"]').value.trim();
            const reason = row.querySelector('textarea[name="c-reason"]').value.trim();
            if (dept || num || name || reason) {
                items.push(
                    '<li><strong>' + esc(dept) + ' ' + esc(num) + ' - ' +
                    esc(name) + ':</strong> ' + esc(reason) + '</li>'
                );
            }
        });
        return '<li><strong>Courses I\'m Taking, &amp; Why:</strong>\n<ol>' +
            items.join("\n") + '</ol></li>';
    }

    function courseList() {
        return Array.from(form.querySelectorAll(".course-row")).map(function (row) {
            return {
                department: row.querySelector('input[name="c-dept"]').value.trim(),
                courseNumber: row.querySelector('input[name="c-num"]').value.trim(),
                courseTitle: row.querySelector('input[name="c-name"]').value.trim(),
                reasonForTaking: row.querySelector('textarea[name="c-reason"]').value.trim()
            };
        }).filter(function (course) {
            return course.department || course.courseNumber ||
                course.courseTitle || course.reasonForTaking;
        });
    }

    /* Colors and fonts come from styles/default.css, exactly like introduction.html. */
    function pageContent(pageHeading) {
        const html = [];
        html.push('<h2>' + pageHeading + '</h2>');
        html.push('<p>' + esc(field("ack")) + ' <em>' + esc(field("signoff")) + '</em></p>');
        html.push(
            '<figure class="intro-photo">' +
            '<img src="' + pictureSrc() + '"' +
            ' alt="' + esc(field("picalt")) + '"' +
            ' width="800" height="800">' +
            '<figcaption>' + esc(field("piccap")) + '</figcaption>' +
            '</figure>'
        );
        html.push('<h6>' + esc(displayName()) + '</h6>');
        html.push('<p>' + esc(field("pstatement")) + '</p>');
        html.push('<ul>');
        html.push(bullet("Personal Background:", "b1"));
        html.push(bullet("Professional Background:", "b2"));
        html.push(bullet("Academic Background:", "b3"));
        html.push(bullet("Primary Work Computer:", "b4"));
        html.push(bullet("Primary Work Location:", "b5"));
        html.push(bullet("Alternate Computer &amp; Location:", "b6"));
        html.push(courseBullet());
        const funny = field("funny");
        if (funny) {
            html.push(bullet("Funny/Interesting Item to Remember Me by:", null, funny));
        }
        const share = field("share");
        if (share) {
            const link = field("sharelink");
            let text = esc(share);
            if (link) {
                text += ' <a href="' + esc(link) + '">Cyberflight Studios</a>';
            }
            html.push('<li><strong>I\'d also Like to Share:</strong> ' + text + '</li>');
        }
        html.push('</ul>');
        html.push(
            '<blockquote><p>' + esc(field("quote")) + '</p>' +
            '<cite>- ' + esc(field("qauthor")) + '</cite></blockquote>'
        );
        return html.join("");
    }

    /* --- M13 serializers --- */

    function buildHTML() {
        return '<!DOCTYPE html>\n' +
            '<html lang="en">\n' +
            '<head>\n' +
            '    <meta charset="UTF-8">\n' +
            '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
            '    <title>Daniel Dorazio\'s Daring Dragon | ITIS3135 | Introduction</title>\n\n' +
            '    <link rel="icon" href="images/favicon.png">\n' +
            '    <link rel="stylesheet" href="styles/default.css">\n' +
            '</head>\n\n' +
            '<body>\n' +
            '    <div data-include="components/header.html"></div>\n\n' +
            '    <main class="layout-alpha">\n' +
            '        ' + pageContent("Introduction") + '\n' +
            '    </main>\n\n' +
            '    <div data-include="components/footer.html"></div>\n' +
            '    <script src="scripts/include.min.js"></script>\n' +
            '</body>\n' +
            '</html>\n';
    }

    /* introductionData schema, matching what the class API accepts
       (see https://intro-form.tommyhost.ing/ for accepted entries). */
    function buildJSON() {
        const data = {
            firstName: field("fname"),
            middleName: field("mname"),
            nickname: field("nname"),
            lastName: field("lname"),
            acknowledgment: field("ack"),
            acknowledgmentDate: acknowledgmentDate(),
            prettyNameDivider: field("divider"),
            adjectives: field("madj"),
            animal: field("manimal"),
            img: jsonImgSrc(),
            pictureAlt: field("picalt"),
            caption: field("piccap"),
            personalInfo: {
                statement: field("pstatement"),
                personalBackground: field("b1"),
                professionalBackground: field("b2"),
                academicBackground: field("b3"),
                primaryWorkComputer: field("b4"),
                primaryWorkLocation: field("b5"),
                alternateComputerLocation: field("b6")
            },
            courses: courseList(),
            quote: field("quote"),
            quoteAuthor: field("qauthor"),
            funnyItem: field("funny"),
            somethingToShare: field("share"),
            footerLinks: [
                { label: "CLT Web", url: field("l1") },
                { label: "GitHub.io", url: field("l2") },
                { label: "GitHub", url: field("l3") },
                { label: "freeCodeCamp", url: field("l4") },
                { label: "Codecademy", url: field("l5") },
                { label: "LinkedIn", url: field("l6") }
            ]
        };
        return JSON.stringify(data, null, 2) + "\n";
    }

    function buildXML() {
        const courses = courseList().map(function (course) {
            return '        <course>\n' +
                '            <department>' + esc(course.department) + '</department>\n' +
                '            <courseNumber>' + esc(course.courseNumber) + '</courseNumber>\n' +
                '            <courseTitle>' + esc(course.courseTitle) + '</courseTitle>\n' +
                '            <reasonForTaking>' + esc(course.reasonForTaking) + '</reasonForTaking>\n' +
                '        </course>';
        }).join("\n");
        const funny = field("funny");
        const share = field("share");
        const link = field("sharelink");
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
            '<introduction>\n' +
            '    <name>\n' +
            '        <first>' + esc(field("fname")) + '</first>\n' +
            '        <middle>' + esc(field("mname")) + '</middle>\n' +
            '        <nickname>' + esc(field("nname")) + '</nickname>\n' +
            '        <last>' + esc(field("lname")) + '</last>\n' +
            '    </name>\n' +
            '    <acknowledgment>\n' +
            '        <statement>' + esc(field("ack")) + '</statement>\n' +
            '        <signOff>' + esc(field("signoff")) + '</signOff>\n' +
            '    </acknowledgment>\n' +
            '    <mascot>\n' +
            '        <adjective>' + esc(field("madj")) + '</adjective>\n' +
            '        <animal>' + esc(field("manimal")) + '</animal>\n' +
            '        <divider>' + esc(field("divider")) + '</divider>\n' +
            '    </mascot>\n' +
            '    <photo src="' + esc(pictureSrc()) + '">\n' +
            '        <caption>' + esc(field("piccap")) + '</caption>\n' +
            '        <altText>' + esc(field("picalt")) + '</altText>\n' +
            '    </photo>\n' +
            '    <personalStatement>' + esc(field("pstatement")) + '</personalStatement>\n' +
            '    <bullets>\n' +
            '        <personalBackground>' + esc(field("b1")) + '</personalBackground>\n' +
            '        <professionalBackground>' + esc(field("b2")) + '</professionalBackground>\n' +
            '        <academicBackground>' + esc(field("b3")) + '</academicBackground>\n' +
            '        <primaryWorkComputer>' + esc(field("b4")) + '</primaryWorkComputer>\n' +
            '        <primaryWorkLocation>' + esc(field("b5")) + '</primaryWorkLocation>\n' +
            '        <alternateComputerAndLocation>' + esc(field("b6")) + '</alternateComputerAndLocation>\n' +
            '        <courses>\n' + courses + '\n' +
            '        </courses>\n' +
            '    </bullets>\n' +
            '    <quote>\n' +
            '        <text>' + esc(field("quote")) + '</text>\n' +
            '        <author>' + esc(field("qauthor")) + '</author>\n' +
            '    </quote>\n';
        if (funny) {
            xml += '    <funnyItem>' + esc(funny) + '</funnyItem>\n';
        }
        if (share) {
            xml += '    <share' + (link ? ' link="' + esc(link) + '"' : '') + '>' +
                esc(share) + '</share>\n';
        }
        xml += '    <footerLinks>\n' +
            '        <cltWeb>' + esc(field("l1")) + '</cltWeb>\n' +
            '        <githubIo>' + esc(field("l2")) + '</githubIo>\n' +
            '        <github>' + esc(field("l3")) + '</github>\n' +
            '        <freeCodeCamp>' + esc(field("l4")) + '</freeCodeCamp>\n' +
            '        <codecademy>' + esc(field("l5")) + '</codecademy>\n' +
            '        <linkedIn>' + esc(field("l6")) + '</linkedIn>\n' +
            '    </footerLinks>\n' +
            '</introduction>\n';
        return xml;
    }

    /* One textarea per output type; regenerating replaces it and moves it to the bottom. */
    function showOutput(type, title, code) {
        const key = "data-gen";
        let box = outputArea.querySelector('div[' + key + '="' + type + '"]');
        if (!box) {
            box = document.createElement("div");
            box.setAttribute(key, type);
            const label = document.createElement("label");
            label.htmlFor = "gen-" + type + "-code";
            label.textContent = title + " (raw code, select all to copy):";
            const area = document.createElement("textarea");
            area.id = "gen-" + type + "-code";
            area.readOnly = true;
            area.rows = 14;
            box.appendChild(label);
            box.appendChild(area);
        }
        box.querySelector("textarea").value = code;
        outputArea.appendChild(box);
    }

    /* --- event handlers, defined last --- */

    picInput.addEventListener("change", function () {
        const file = picInput.files && picInput.files[0];
        if (!file) {
            uploadedImage = null;
            picPreview.src = DEFAULT_PICTURE;
            return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
            uploadedImage = event.target.result;
            picPreview.src = uploadedImage;
        };
        reader.readAsDataURL(file);
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        main.innerHTML = '<h2>Introduction Form</h2>\n' + pageContent("Introduction Form") +
            '<p><a href="introduction_form.html">Go again</a></p>';
        window.scrollTo(0, 0);
    });

    document.getElementById("generate-html").addEventListener("click", function () {
        showOutput("html", "HTML Output", buildHTML());
    });

    document.getElementById("generate-json").addEventListener("click", function () {
        showOutput("json", "JSON Output", buildJSON());
    });

    document.getElementById("generate-xml").addEventListener("click", function () {
        showOutput("xml", "XML Output", buildXML());
    });

    document.getElementById("add-course").addEventListener("click", function () {
        courseCount += 1;
        const rows = form.querySelectorAll(".course-row");
        const clone = rows[0].cloneNode(true);
        clone.querySelectorAll("input, textarea").forEach(function (fieldEl) {
            fieldEl.value = "";
        });
        renumber(clone, courseCount);
        rows[rows.length - 1].after(clone);
    });

    form.addEventListener("click", function (event) {
        if (event.target.classList.contains("remove-course")) {
            event.target.closest(".course-row").remove();
        }
    });

    /* Clear empties every field; unlike Reset it leaves the default prefills out. */
    document.getElementById("clear-form").addEventListener("click", function () {
        form.reset();
        form.querySelectorAll("input, textarea").forEach(function (fieldEl) {
            if (fieldEl.type !== "file") {
                fieldEl.value = "";
            }
        });
        picInput.value = "";
        uploadedImage = null;
        picPreview.src = DEFAULT_PICTURE;
        const rows = form.querySelectorAll(".course-row");
        rows.forEach(function (row, index) {
            if (index > 0) {
                row.remove();
            }
        });
        const first = rows[0];
        first.querySelectorAll("input, textarea").forEach(function (fieldEl) {
            fieldEl.value = "";
        });
        renumber(first, 1);
    });
});
