import * as pdfjsLib from "pdfjs-dist";
import React, { useState } from "react";
import ProgressBar from "react-customizable-progressbar";
import { BsFillTrashFill } from "react-icons/bs";
import "./App.css";
const BASE64_MARKER = ";base64,";
let sliderTimer = null;
let number = 1;
let seletedFilePos = -1;

let addNewClickCount = 0;
const nameSplit = "&&&&";

function App() {
  const [isActive, setIsActive] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [response, setisResponse] = useState(false);
  const [value, setValue] = useState("");
  const [user, setUser] = useState([]);
  const [pdfFileError, setPdfFileError] = useState("");
  const [progressMsg, serPregressMsg] = useState("");
  const [pagesText, setTagesText] = useState([]);
  const [noOfRecords, setNoOfSentences] = useState(0);
  const [showOtpTime, setShowOtpTime] = useState(1);
  const [progressBar, setShowProgessbar] = useState(false);
  const [isUploadFile, setUploadFile] = useState(true);
  const [pdfUrl, setPdfUrl] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  //New
  const [isView2, setView2] = useState(false);
  const [isView3, setView3] = useState(false);
  const ref2 = React.createRef();
  const ref3 = React.createRef();


  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleChangeRadio = (event) => {
    let value = event.target.value;
    if (value === "hasUpload") {
      setUploadFile(true);
    } else {
      setUploadFile(false);
    }
  };
  const handlePdfUrl = (e) => {
    setPdfUrl(e.target.value);
  };

  const postData = async () => {
    console.log("pagesText  - - " + JSON.stringify(pagesText));

    // try {
    //   startTimer();
    //   setShowProgessbar(true);
    //   serPregressMsg("Getting Trained on Prescription.");
    //   let url = `https://myglobalssfunction.azurewebsites.net/api/httptrigger2`;
    //   console.log("no of records are" + noOfRecords);
    //   const res = await fetch(url, {
    //     method: "post",
    //     body: JSON.stringify({
    //        pdfContent: isUploadFile ? pagesText[0] : "test",
    //       myQuery: "test",
    //       noOfRecords: Number(noOfRecords),
    //       pdfUrl: !isUploadFile ? pdfUrl : "test",
    //     }),
    //   });
    //   console.log(res.status);
    //   if (res.status === 200) {
    //     // const json = await res.text();
    //     setIsActive(false);
    //   } else {
    //     setPdfFileError("");
    //   }
    //   setShowProgessbar(false);
    // } catch (err) {
    //   console.error("err", err);
    //   setShowProgessbar(false);
    //   clearInterval(sliderTimer);
    // }
  };

  const handleNoOfRecords = (e) => {
    let noOfRecords = e.target.value;
    setNoOfSentences(noOfRecords);
  };
  const handleUserId = (e) => {
    let value = e.target.value;
    setUserId(value);
  };
  const handlePassword = (e) => {
    let value = e.target.value;
    setPassword(value);
  };
  const handleLoginClick = () => {
    console.log("password - ", password, userId);
    if (userId === "test" && password === "1234") {
      setIsLogin(false);
    } else {
      alert("User ID or password incorrect");
    }
  };

  const fetchData = async () => {
    try {
      number = 1;
      startTimer();
      setUser([]);
      setisResponse(false);
      setShowProgessbar(true);
      serPregressMsg("Retrieving Answer");
      let url = `https://myglobalssfunction.azurewebsites.net/api/httptrigger2`;
      console.log("PDF Text is" + pagesText[0]);
      const res = await fetch(url, {
        method: "post",
        body: JSON.stringify({
          pdfContent: "test",
          myQuery: value,
          noOfRecords: noOfRecords,
        }),
      });
      const json = await res.text();
      setIsActive(false);
      let myResponse = "";
      myResponse = json.toString().split("DDDDDD");
      setUser(myResponse);
      setisResponse(true);
      setShowProgessbar(false);
    } catch (err) {
      console.error("err", err);
    }
  };

  const onPressBack = () => {
    setisResponse(false);
    setIsActive(true);
    setValue("");
  };
  // onchange event
  const fileType = ["application/pdf"];

  const handlePdfFileChange1 = (e) => {
    seletedFilePos = 1;
    handlePdfFileChange(e);
  };
  const handlePdfFileChange2 = (e) => {
    seletedFilePos = 2;
    handlePdfFileChange(e);
  };
  const handlePdfFileChange3 = (e) => {
    seletedFilePos = 3;
    handlePdfFileChange(e);
  };
  
  const handlePdfFileChange = (e) => {
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (fileType.includes(selectedFile.type)) {
        let reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onloadend = (e) => {
          convertDataURIToBinary(e.target.result,  selectedFile.name);
        };
      } else {
        e.currentTarget.value = null;
        alert("Please select valid pdf file");
      }
    } else {
      console.log("select your file");
    }
  };
  const convertDataURIToBinary = (dataURI,selectedFileName) => {
    let base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    let base64 = dataURI.substring(base64Index);
    let raw = window.atob(base64);
    let rawLength = raw.length;
    let array = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    pdfAsArray(array,selectedFileName);
  };

  const pdfAsArray = (pdfAsArray,selectedFileName) => {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

    pdfjsLib.getDocument(pdfAsArray).promise.then(
      function (pdf) {
        var pdfDocument = pdf;
        var pagesPromises = [];

        for (var i = 0; i < pdf._pdfInfo.numPages; i++) {
          (function (pageNumber) {
            pagesPromises.push(getPageText(pageNumber, pdfDocument));
          })(i + 1);
        }

        // Execute all the promises
        Promise.all(pagesPromises).then(function (pagetest) {
          let updatePageText = selectedFileName + nameSplit + pagetest;
          let tempItemArr = pagesText;
          if (seletedFilePos === 1) {
            tempItemArr.splice(0, 1, updatePageText);
          } else if (seletedFilePos === 2) {
            tempItemArr.splice(1, 1, updatePageText);
          } else if (seletedFilePos === 3) {
            tempItemArr.splice(2, 1, updatePageText);
          }
          setTagesText(tempItemArr);
          setPdfFileError("");
        });
      },
      function (reason) {
        // PDF loading error
        console.error(reason);
      }
    );
  };
  const getPageText = (pageNum, PDFDocumentInstance) => {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise(function (resolve, reject) {
      PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
        // The main trick to obtain the text of the PDF page, use the getTextContent method
        pdfPage.getTextContent().then(function (textContent) {
          let textItems = textContent.items;
          let finalString = "";

          // Concatenate the string of the item to the final string
          for (let i = 0; i < textItems.length; i++) {
            let item = textItems[i];

            finalString += item.str + " ";
          }

          // Solve promise with the text retrieven from the page
          resolve(finalString);
        });
      });
    });
  };
  const startTimer = () => {
    sliderTimer = setInterval(() => {
      try {
        number = number + 3;
        setShowOtpTime(number);
        if (number >= 100) {
          clearInterval(sliderTimer);
        }
      } catch (error) {
        clearInterval(sliderTimer);
        console.log("error  - - - " + error);
      }
    }, 500);
  };
  const addNewClick = () => {
    if (addNewClickCount >= 2) {
      console.log("return");
      return;
    }
    addNewClickCount++;
    if (addNewClickCount === 1) {
      setView2(true);
    }
    if (addNewClickCount === 2) {
      setView3(true);
    }
  };
  const removeView2 = () => {
    try {
      const currentFileName = ref2.current.files[0].name;
      let index = pagesText?.findIndex(
        (value) => value.split(nameSplit)[0] === currentFileName
      );
      if (index > -1) {
        // only splice array when item is found
        pagesText.splice(index, 1);
        setTagesText(pagesText);
        addNewClickCount = 0;
        setView2(false);
      }
    } catch (error) {
      addNewClickCount = 0;
      setView2(false);
    }
  };
  const removeView3 = () => {
    try {
      const currentFileName = ref3.current.files[0].name;
      let index = pagesText?.findIndex(
        (value) => value.split(nameSplit)[0] === currentFileName
      );
      if (index > -1) {
        // only splice array when item is found
        pagesText.splice(index, 1);
        setTagesText(pagesText);
        --addNewClickCount;
        setView3(false);
      }
    } catch (error) {
      --addNewClickCount;
      setView3(false);
    }
  };
  return (
    <div>
      <div className="My header">
        <img style={{ margin: 10 }} src={require("./headerLogo.png")} />
      </div>
      {progressBar ? (
        <div>
          <ProgressBar
            className="indicator"
            progress={showOtpTime}
            radius={50}
            strokeWidth={10}
            initialAnimation={true}
            strokeColor="#5a2e6f"
          />
          <h6
            className="d-flex justify-content-center color"
            style={{ color: "#5a2e6f" }}
          >
            {progressMsg}
          </h6>
        </div>
      ) : null}
      {isLogin ? (
        <div className="d-flex justify-content-center">
          <div className="borderStyle">
            <h1 style={{ color: "#5a2e6f", marginBottom: 20 }}>Login</h1>
            <div>
              <input
                style={{ marginTop: 10, width: 300 }}
                placeholder="Enter userId"
                onChange={handleUserId}
              ></input>
            </div>
            <div>
              <input
                style={{ marginTop: 10, width: 300 }}
                type={"password"}
                placeholder="Enter password"
                onChange={handlePassword}
              ></input>
            </div>
            <div
              style={{
                textAlign: "center",
                marginTop: 20,
              }}
            >
              <button
                onClick={handleLoginClick}
                className="button"
                type="button"
                id="button"
                name="Submit"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      ) : isActive ? (
        <div className="d-flex justify-content-center">
          <div className="borderStyle">
            <h1 style={{ color: "#5a2e6f", marginBottom: 20 }}>
              Ask Me Anything
            </h1>
            <h6 style={{ color: "#5a2e6f", marginBottom: 20 }}>
              You can upload any pdf file and Ask me questions on that in
              natural Language
            </h6>
            <div onChange={handleChangeRadio}>
              <input
                type="radio"
                className="form-check-input"
                name="flexRadioDefault"
                id="flexRadioDefault1"
                value="hasUpload"
                checked={isUploadFile}
              />
              <label style={{ marginLeft: 5 }}>Upload File</label>
              <input
                style={{ marginLeft: 10 }}
                type="radio"
                className="form-check-input"
                name="flexRadioDefault"
                id="flexRadioDefault2"
                value="hasURL"
              />

              <label style={{ marginLeft: 5 }}>URL</label>
            </div>
            {isUploadFile ? (
              <div>
                <div className="padding">
                  <input type={"file"} onChange={handlePdfFileChange1}></input>
                  <button
                    onClick={addNewClick}
                    className="addnewbutton"
                    type="button"
                    id="button"
                    name="addnew"
                  >
                    Add more files
                  </button>
                </div>

                {isView2 ? (
                  <div className="padding">
                    <input
                      ref={ref2}
                      type={"file"}
                      onChange={handlePdfFileChange2}
                    ></input>
                    <BsFillTrashFill className="margin" onClick={removeView2} />
                  </div>
                ) : null}

                {isView3 ? (
                  <div className="padding">
                    <input
                      ref={ref3}
                      type={"file"}
                      onChange={handlePdfFileChange3}
                    ></input>
                    <BsFillTrashFill className="margin" onClick={removeView3} />
                  </div>
                ) : null}
              </div>
           ) : (
              <div>
                <input
                  style={{ marginTop: 10 }}
                  type={"url"}
                  placeholder="URL..."
                  onChange={handlePdfUrl}
                ></input>
              </div>
            )}

            <input
              style={{ marginTop: 10 }}
              type={"number"}
              placeholder="Number of Sentences"
              onChange={handleNoOfRecords}
            ></input>

            <div
              style={{
                textAlign: "center",
                marginTop: 20,
              }}
            >
              <button
                onClick={postData}
                // onClick={startTimer}
                className="button"
                type="button"
                id="button"
                name="Submit"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: -50 }}>
          <div className="d-flex justify-content-center">
            <div>
              <button onClick={onPressBack} className="backbutton">
                Back
              </button>

              <h4 style={{ color: "#5a2e6f", marginBottom: 20 }}>
                Ask Me Anything
              </h4>
              <textarea
                style={{ fontSize: 20 }}
                name="postContent"
                rows={3}
                cols={60}
                value={value}
                onChange={handleChange}
              />
              <div
                style={{
                  textAlign: "center",
                  marginTop: 20,
                }}
              >
                <button
                  onClick={fetchData}
                  className="button"
                  type="button"
                  id="button"
                  name="Submit"
                >
                  Get Answer
                </button>
              </div>
            </div>
          </div>
          {response ? (
            <div className="d-flex justify-content-center">
              <div>
                <h5 style={{ color: "#5a2e6f" }}>Generative AI Answer</h5>
                <textarea rows={2} cols={100}>
                  {user[0]}
                </textarea>
              </div>
            </div>
          ) : null}
          {response ? (
            <div className="d-flex justify-content-center">
              <div>
                <h5 style={{ color: "#5a2e6f" }}>Fact Check From document</h5>
                <textarea rows={6} cols={100}>
                  {user[1]}
                </textarea>
              </div>
            </div>
          ) : null}
        </div>
      )}
      <div
        style={{ position: "absolute", bottom: 0, left: 0 }}
        className="footer"
      >
        <p> ©2023 Aetna Inc.</p>
      </div>
    </div>
  );
}

export default App;
