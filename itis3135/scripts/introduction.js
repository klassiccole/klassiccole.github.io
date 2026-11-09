/*! introduction.js | builds an introduction page out of introduction_form.html
    Part 1: collects data and swaps the form for the rebuilt page on submit. */

/* Uploaded image data URL; null means use the default course picture. */
let uploadedImage = null;

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("intro-form");
    const main = document.querySelector("main");
    const picInput = document.getElementById("picupload");
    const picPreview = document.getElementById("pic-preview");
    const DEFAULT_PICTURE = "images/intro.webp";
    let courseCount = form.querySelectorAll(".course-row").length;

    /* Used before the event handlers below. */
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

    /* Colors and fonts come from styles/default.css, exactly like introduction.html,
        except the h2 reads Introduction Form. */
    function build() {
        const html = [];
        html.push('<h2>Introduction Form</h2>');
        html.push('<p>' + esc(field("ack")) + ' <em>' + esc(field("signoff")) + '</em></p>');
        html.push(
            '<figure class="intro-photo">' +
            '<img src="' + (uploadedImage ? uploadedImage : DEFAULT_PICTURE) + '"' +
            ' alt="' + esc(field("piccap")) + '"' +
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
        html.push('<p><a href="introduction_form.html">Go again</a></p>');
        return html.join("");
    }

    /* Event handlers, defined last. */
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
        main.innerHTML = build();
        window.scrollTo(0, 0);
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
        form.querySelectorAll("input, textarea").forEach(function (field) {
            if (field.type !== "file") {
                field.value = "";
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
