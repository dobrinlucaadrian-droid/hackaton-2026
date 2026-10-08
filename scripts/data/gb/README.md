# United Kingdom (gb) - NOT BUILT (checked 2026-10-08)

Outcome: no data files were written. No build.mjs exists.

## Sources opened and why none could be used

1. HESA, Discover Uni dataset page and downloads
   (https://www.hesa.ac.uk/data-and-analysis/discover-uni-dataset, plus /download,
   /support/documentation/discover-uni, /files/ and the old KIS link
   http://www.hesa.ac.uk/index.php?option=com_content&task=view&id=2609):
   every request returned HTTP 403 with a Cloudflare "Just a moment..." challenge. This is the only place the
   bulk files (XML/CSV) are published. Getting past the challenge would be working around a block, so it was not tried.
   The licence of the current dataset could not be read.
2. data.gov.uk (CKAN API search "unistats"): one entry, "KIS / Unistats data", licence "UK Open Government Licence (OGL)",
   last modified 2014-05-10. Its only resource is the same hesa.ac.uk link (403 as above) and the data is the old
   2014 Key Information Set, not the current dataset. Not usable. (Searches for "discover uni" gave 0 results.)
3. Discover Uni website (https://discoveruni.gov.uk/about-our-data/, /information-providers/): opened (HTTP 200). It says the
   2026 dataset (C26061, courses running 2027-28) was published on 1 October 2026 and is collected with HESA, but it offers
   no download link and no licence statement for the data. Its page JavaScript points to an internal search API
   (search-api-v2-prod-...azurewebsites.net); that is the site's own backend, not a documented open download, so it was not used.
4. Discover Uni terms of use (https://discoveruni.gov.uk/terms-and-conditions-use/): quote: "The copyright and database right
   in the materials, data, reports and publications available for download or viewing from this website are held by the
   organisation named as the copyright or database right owner" and text may be copied "provided that the source is
   acknowledged, the text is not altered and it is not used, wholly or in part, for commercial gain. Use for commercial gain
   requires the prior written permission of the copyright holders." This is not an open licence for the data.
5. OfS page https://www.officeforstudents.org.uk/data-and-analysis/discover-uni-data-set/ : HTTP 404 (and /discover-uni/ : 404).

## What would unblock it
Someone opens the HESA Discover Uni page in a normal browser, downloads the current dataset, and reads its licence
(earlier research believed it is open with attribution to HESA; not confirmed). Then build.mjs can be written from the files.
Do not use UCAS (proprietary).
