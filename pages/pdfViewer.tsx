import React, { useState, useRef } from 'react';
import { usePdf } from '@mikecousins/react-pdf';
import Link from 'next/link';

const MyPdfViewer = () => {
  const [page, setPage] = useState(1);
  const canvasRef = useRef(null);

  const { pdfDocument, pdfPage } = usePdf({
    file: '/docs/FYP-Final-Report.pdf',
    page,
    canvasRef,
    onDocumentLoadFail: () => {
      console.error("load error")
    }
  });

  return (
    <div className='p-5 shadow-lg'>
      {!pdfDocument && <span>Loading...</span>}
      {(pdfDocument && pdfDocument.numPages) && (
        <nav>
          <ul className="pager flex flex-row justify-between">
            <li className="previous">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
            </li>
            <li className="next">
              <button
                disabled={page === pdfDocument.numPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
      <canvas ref={canvasRef} />
      {(pdfDocument && pdfDocument.numPages) && (
        <nav>
          <ul className="pager flex flex-row justify-between">
            <li className="previous">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
            </li>
            <li className="next">
              <button
                disabled={page === pdfDocument.numPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default MyPdfViewer