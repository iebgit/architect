from flask import Flask, request, jsonify
from flask_cors import CORS
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EC2, Lambda, Fargate
from diagrams.aws.database import RDS, DB, Aurora
from diagrams.aws.storage import S3
from diagrams.aws.network import CloudFront, DirectConnect, GlobalAccelerator
from diagrams.aws.management import Cloudformation, TrustedAdvisor, Config
from diagrams.aws.security import IAM, KMS, Shield
from diagrams.aws.integration import SQS, StepFunctions
from diagrams.aws.management import Cloudtrail, Organizations
from diagrams.aws.analytics import Glue, Redshift
from diagrams.aws.cost import Budgets, SavingsPlans, CostExplorer
from diagrams.aws.general import Marketplace
import base64
from io import BytesIO

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Dictionary to map service names to diagram nodes
service_mapping = {
    "Amazon EC2": EC2,
    "AWS Lambda": Lambda,
    "Amazon RDS": RDS,
    "Amazon S3": S3,
    "AWS CloudFormation": Cloudformation,
    "AWS Direct Connect": DirectConnect,
    "Amazon DynamoDB": DB,
    "AWS Trusted Advisor": TrustedAdvisor,
    "Amazon CloudFront": CloudFront,
    "AWS Global Accelerator": GlobalAccelerator,
    "AWS Step Functions": StepFunctions,
    "AWS Cost Explorer": CostExplorer,
    "AWS IAM": IAM,
    "AWS KMS": KMS,
    "AWS Shield": Shield,
    "Amazon SQS": SQS,
    "AWS Glue": Glue,
    "Amazon Redshift": Redshift,
    "AWS Budgets": Budgets,
    "AWS Savings Plans": SavingsPlans,
    "AWS Marketplace": Marketplace
}

common_configurations = {
    "Amazon EC2": [("AWS Lambda", "Invokes"), ("Amazon RDS", "Reads/Writes"), ("Amazon S3", "Stores Data")],
    "AWS Lambda": [("Amazon S3", "Triggers"), ("Amazon DynamoDB", "Reads/Writes")],
    "Amazon RDS": [("Amazon S3", "Backups")],
    "Amazon S3": [("Amazon CloudFront", "Delivers")],
    "Amazon CloudFront": [("AWS Global Accelerator", "Accelerates")],
    "AWS Step Functions": [("AWS Lambda", "Orchestrates"), ("Amazon SQS", "Queues")],
    "AWS Glue": [("Amazon Redshift", "ETL")]
}

@app.route('/generate-diagram', methods=['POST'])
def generate_diagram():
    data = request.json
    recommended_services = data.get('services', [])

    # Generate the diagram and save to a file
    file_path = "diagrams_image.png"
    clusters = []
    service_nodes = {}
    added_services = set()

    for service, dependencies in common_configurations.items():
        if service in recommended_services:
            cluster_services = {service}
            for dependency, label in dependencies:
                if dependency in recommended_services:
                    cluster_services.add(dependency)
            if cluster_services - added_services:
                clusters.append(cluster_services)
                added_services.update(cluster_services)

    with Diagram("", show=False, graph_attr={"splines": "ortho", "bgcolor": "transparent"}) as diag:
        for cluster_services in clusters:
            with Cluster("Amazon Web Services"):
                for service in cluster_services:
                    if service in service_mapping:
                        service_nodes[service] = service_mapping[service](service)
            for service in cluster_services:
                if service in service_mapping:
                    for dependency, label in common_configurations.get(service, []):
                        if dependency in service_nodes:
                            service_nodes[service] >> Edge(label=label) >> service_nodes[dependency]

    # Read the file and encode it in base64
    with open(file_path, "rb") as image_file:
        img_base64 = base64.b64encode(image_file.read()).decode('utf-8')

    return jsonify({"message": "Diagram generated successfully", "image": img_base64})
if __name__ == '__main__':
    app.run(debug=True)
