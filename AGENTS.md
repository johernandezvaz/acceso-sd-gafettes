<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Visitor Badge Printing Rules (CODA)
- **Printer:** Brother QL-810W
- **Badge Dimensions:** 53 mm × 84.5 mm
- **Orientation:** Portrait (Vertical)
- **Colors:** Strictly Black & White (#000000 and #FFFFFF only)
- **Printing Architecture:** Brother QL Raster Command Stream (`lib/printing/brother/`) & Portrait Driver Print
- **DO NOT USE:** Zebra, ZPL, `^XA`, `^XZ`, `^FO`, `^FD`, `^PW`, `^LL`, `^BQN` or any Zebra-specific commands.
