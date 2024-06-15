import React, { useEffect, useState } from 'react';
import axios from 'axios';
import logo from './ibis.png';
const questions = [
  {
    question: "What are the primary goals and objectives of your project?",
    options: ["Increase performance", "Reduce costs", "Improve security", "Other"],
    services: {
      "Increase performance": ["Amazon EC2", "AWS Lambda", "Amazon RDS"],
      "Reduce costs": ["Amazon S3", "AWS EC2 Spot Instances", "AWS Cost Explorer"],
      "Improve security": ["AWS IAM", "AWS KMS", "AWS Shield"],
      "Other": ["AWS CloudFormation", "AWS Elastic Beanstalk"]
    }
  },
  {
    question: "Can you describe your current IT infrastructure and the applications you are running?",
    options: ["On-premises", "Cloud-based", "Hybrid", "Other"],
    services: {
      "On-premises": ["AWS Direct Connect", "AWS Storage Gateway"],
      "Cloud-based": ["Amazon EC2", "Amazon S3"],
      "Hybrid": ["AWS Outposts", "AWS VPN"],
      "Other": ["AWS Elastic Beanstalk"]
    }
  },
  {
    question: "What types of data will you be storing and processing in AWS?",
    options: ["Structured data", "Unstructured data", "Both", "Not sure"],
    services: {
      "Structured data": ["Amazon RDS", "Amazon Aurora"],
      "Unstructured data": ["Amazon S3", "Amazon DynamoDB"],
      "Both": ["Amazon Redshift", "AWS Glue"],
      "Not sure": ["AWS Lake Formation"]
    }
  },
  {
    question: "Do you have any specific security, compliance, or regulatory requirements?",
    options: ["Yes", "No", "Not sure", "Other"],
    services: {
      "Yes": ["AWS Config", "AWS CloudTrail"],
      "No": ["AWS IAM"],
      "Not sure": ["AWS Trusted Advisor"],
      "Other": ["AWS Artifact"]
    }
  },
  {
    question: "What are the typical workload patterns?",
    options: ["Constant", "Spiky", "Periodic", "Other"],
    services: {
      "Constant": ["Amazon EC2", "Amazon RDS"],
      "Spiky": ["AWS Lambda", "Amazon SQS"],
      "Periodic": ["Amazon CloudWatch", "AWS Batch"],
      "Other": ["AWS Fargate"]
    }
  },
  {
    question: "How many users will need access to the AWS environment, and what roles will they have?",
    options: ["<10 users", "10-50 users", "50-200 users", ">200 users"],
    services: {
      "<10 users": ["AWS IAM"],
      "10-50 users": ["AWS IAM", "AWS SSO"],
      "50-200 users": ["AWS Organizations"],
      ">200 users": ["AWS SSO", "AWS Directory Service"]
    }
  },
  {
    question: "What is your current disaster recovery and backup strategy?",
    options: ["Manual", "Automated", "No strategy", "Other"],
    services: {
      "Manual": ["AWS Backup", "Amazon S3"],
      "Automated": ["AWS Backup", "AWS CloudFormation"],
      "No strategy": ["AWS Backup", "AWS Disaster Recovery"],
      "Other": ["Amazon RDS Snapshots"]
    }
  },
  {
    question: "What is your budget for the AWS cloud services?",
    options: ["<$10k", "$10k-$50k", "$50k-$100k", ">$100k"],
    services: {
      "<$10k": ["AWS Free Tier", "AWS Budgets"],
      "$10k-$50k": ["AWS Cost Explorer", "AWS Savings Plans"],
      "$50k-$100k": ["AWS Cost Explorer", "AWS Reserved Instances"],
      ">$100k": ["AWS Enterprise Support"]
    }
  },
  {
    question: "Do you need to integrate AWS services with other systems or third-party services?",
    options: ["Yes", "No", "Not sure", "Other"],
    services: {
      "Yes": ["AWS AppSync", "AWS Step Functions"],
      "No": ["Amazon EC2"],
      "Not sure": ["AWS Glue"],
      "Other": ["AWS Lambda"]
    }
  },
  {
    question: "What are your plans for future growth and expansion?",
    options: ["Expand globally", "Increase capacity", "Introduce new services", "Other"],
    services: {
      "Expand globally": ["AWS Global Accelerator", "Amazon CloudFront"],
      "Increase capacity": ["Amazon EC2 Auto Scaling"],
      "Introduce new services": ["AWS Service Catalog"],
      "Other": ["AWS Marketplace"]
    }
  }
];

const Questionnaire = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [selectedServices, setSelectedServices] = useState([]);
  const [image, setImage] = useState(null);
  const [show, setShow] = useState(false);


  const handleAnswer = async (answer) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = answer;
    setAnswers(updatedAnswers);

    const currentServices = questions[currentQuestion].services[answer] || [];
    setSelectedServices(prevServices => [...new Set([...prevServices, ...currentServices])]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Send selected services to the backend to generate the diagram
      try {
        const response = await axios.post('http://localhost:5000/generate-diagram', { services: selectedServices })
        console.log(response.data.message);
        console.log(response)
        setImage(`data:image/png;base64,${response.data.image}`);
      } catch (e) {console.error("Error generating diagram: ", e)}
      
    }
  };

  useEffect( () => {
    if (image){
      setShow(true)
    }

    
  }, [image])
  

  return (
    <div>
      <br/>
      <img src={logo} alt="AWS Diagram" height={100} onClick={() => window.location.reload(false)} />
      <h1>IBIS Architect</h1>
      {!show ? (
         <div className="question">
         <h2>{questions[currentQuestion].question}</h2>
         <ul className="options">
           {questions[currentQuestion].options.map((option, index) => (
             <li key={index} className="option">
               <button onClick={() => handleAnswer(option)}>{option}</button>
             </li>
           ))}
         </ul>
       </div>
     ) : (
       <div className="image-container">
         {image && <img src={image} alt="AWS Diagram" />}
       </div>
     )}
    </div>
  );
};

export default Questionnaire;
