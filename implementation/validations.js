const core = require('@actions/core');

function validateNumericInputs() {
  const ephemeralStorage = parseInt(core.getInput('ephemeral-storage', { required: false })) || 512;
  if (ephemeralStorage < 512 || ephemeralStorage > 10240) {
    core.setFailed(`Ephemeral storage must be between 512 MB and 10,240 MB, got: ${ephemeralStorage}`);
    return { valid: false };
  }

  const memorySize = core.getInput('memory-size', { required: false });
  let parsedMemorySize;
  if (memorySize !== '') {
    parsedMemorySize = parseInt(memorySize);
    if (isNaN(parsedMemorySize) || parsedMemorySize < 128 || parsedMemorySize > 10240) {
      core.setFailed(`Memory size must be between 128 MB and 10,240 MB, got: ${memorySize}`);
      return { valid: false };
    }
  }

  const timeout = parseInt(core.getInput('timeout', { required: false })) || 3;
  if (timeout < 1 || timeout > 900) {
    core.setFailed(`Timeout must be between 1 and 900 seconds, got: ${timeout}`);
    return { valid: false };
  }

  return { 
    valid: true, 
    ephemeralStorage, 
    parsedMemorySize, 
    timeout 
  };
}

function validateRequiredInputs() {
  const functionName = core.getInput('function-name', { required: true });
  if (!functionName) {
    core.setFailed('Function name must be provided');
    return { valid: false };
  }

  const region = core.getInput('region', { required: true });
  if (!region) {
    core.setFailed('Region must be provided');
    return { valid: false };
  }

  const codeArtifactsDir = core.getInput('code-artifacts-dir');
  if (!codeArtifactsDir) {
    core.setFailed('Code-artifacts-dir must be provided');
    return { valid: false };
  }

  return { 
    valid: true, 
    functionName, 
    region, 
    codeArtifactsDir 
  };
}

function validateArnInputs() {
  const role = core.getInput('role', { required: false });
  const codeSigningConfigArn = core.getInput('code-signing-config-arn', { required: false });
  const kmsKeyArn = core.getInput('kms-key-arn', { required: false });
  const sourceKmsKeyArn = core.getInput('source-kms-key-arn', { required: false });
  
  if (role && !validateRoleArn(role)) {
    return { valid: false };
  }
  
  if (codeSigningConfigArn && !validateCodeSigningConfigArn(codeSigningConfigArn)) {
    return { valid: false };
  }
  
  if (kmsKeyArn && !validateKmsKeyArn(kmsKeyArn)) {
    return { valid: false };
  }
  
  if (sourceKmsKeyArn && !validateKmsKeyArn(sourceKmsKeyArn)) {
    return { valid: false };
  }

  return {
    valid: true,
    role,
    codeSigningConfigArn,
    kmsKeyArn,
    sourceKmsKeyArn
  };
}

function validateJsonInputs() {
  const environment = core.getInput('environment', { required: false });
  const vpcConfig = core.getInput('vpc-config', { required: false });
  const deadLetterConfig = core.getInput('dead-letter-config', { required: false });
  const tracingConfig = core.getInput('tracing-config', { required: false });
  const layers = core.getInput('layers', { required: false });
  const fileSystemConfigs = core.getInput('file-system-configs', { required: false });
  const imageConfig = core.getInput('image-config', { required: false });
  const snapStart = core.getInput('snap-start', { required: false });
  const loggingConfig = core.getInput('logging-config', { required: false });
  const tags = core.getInput('tags', { required: false });
  
  let parsedEnvironment, parsedVpcConfig, parsedDeadLetterConfig, parsedTracingConfig,
    parsedLayers, parsedFileSystemConfigs, parsedImageConfig, parsedSnapStart,
    parsedLoggingConfig, parsedTags;

  try {
    if (environment) {
      parsedEnvironment = parseJsonInput(environment, 'environment');
    }
    
    if (vpcConfig) {
      parsedVpcConfig = parseJsonInput(vpcConfig, 'vpc-config');
      if (!parsedVpcConfig.SubnetIds || !Array.isArray(parsedVpcConfig.SubnetIds)) {
        throw new Error("vpc-config must include 'SubnetIds' as an array");
      }
      if (!parsedVpcConfig.SecurityGroupIds || !Array.isArray(parsedVpcConfig.SecurityGroupIds)) {
        throw new Error("vpc-config must include 'SecurityGroupIds' as an array");
      }
    }
    
    if (deadLetterConfig) {
      parsedDeadLetterConfig = parseJsonInput(deadLetterConfig, 'dead-letter-config');
      if (!parsedDeadLetterConfig.TargetArn) {
        throw new Error("dead-letter-config must include 'TargetArn'");
      }
    }
    
    if (tracingConfig) {
      parsedTracingConfig = parseJsonInput(tracingConfig, 'tracing-config');
      if (!parsedTracingConfig.Mode || !['Active', 'PassThrough'].includes(parsedTracingConfig.Mode)) {
        throw new Error("tracing-config Mode must be 'Active' or 'PassThrough'");
      }
    }
    
    if (layers) {
      parsedLayers = parseJsonInput(layers, 'layers');
      if (!Array.isArray(parsedLayers)) {
        throw new Error("layers must be an array of layer ARNs");
      }
    }
    
    if (fileSystemConfigs) {
      parsedFileSystemConfigs = parseJsonInput(fileSystemConfigs, 'file-system-configs');
      if (!Array.isArray(parsedFileSystemConfigs)) {
        throw new Error("file-system-configs must be an array");
      }
      for (const config of parsedFileSystemConfigs) {
        if (!config.Arn || !config.LocalMountPath) {
          throw new Error("Each file-system-config must include 'Arn' and 'LocalMountPath'");
        }
      }
    }
    
    if (imageConfig) {
      parsedImageConfig = parseJsonInput(imageConfig, 'image-config');
    }
    
    if (snapStart) {
      parsedSnapStart = parseJsonInput(snapStart, 'snap-start');
      if (!parsedSnapStart.ApplyOn || !['PublishedVersions', 'None'].includes(parsedSnapStart.ApplyOn)) {
        throw new Error("snap-start ApplyOn must be 'PublishedVersions' or 'None'");
      }
    }
    
    if (loggingConfig) {
      parsedLoggingConfig = parseJsonInput(loggingConfig, 'logging-config');
    }
    
    if (tags) {
      parsedTags = parseJsonInput(tags, 'tags');
      if (typeof parsedTags !== 'object' || Array.isArray(parsedTags)) {
        throw new Error("tags must be an object of key-value pairs");
      }
    }
  } catch (error) {
    core.setFailed(`Input validation error: ${error.message}`);
    return { valid: false };
  }

  return {
    valid: true,
    environment,
    vpcConfig,
    deadLetterConfig,
    tracingConfig,
    layers,
    fileSystemConfigs, 
    imageConfig,
    snapStart,
    loggingConfig,
    tags,
    parsedEnvironment,
    parsedVpcConfig,
    parsedDeadLetterConfig,
    parsedTracingConfig,
    parsedLayers,
    parsedFileSystemConfigs,
    parsedImageConfig, 
    parsedSnapStart,
    parsedLoggingConfig,
    parsedTags
  };
}

function getAdditionalInputs() {
  const functionDescription = core.getInput('function-description', { required: false });
  const packageType = 'Zip';
  const dryRun = core.getBooleanInput('dry-run', { required: false }) || false;
  
  // Fix publish flag to properly handle boolean input
  let publish;
  try {
    publish = core.getBooleanInput('publish', { required: false });
  } catch (error) {
    publish = true; // Default to true only if not explicitly set
  }
  
  const revisionId = core.getInput('revision-id', { required: false });
  const runtime = core.getInput('runtime', { required: false }) || 'nodejs20.x';
  const handler = core.getInput('handler', { required: false });
  const architectures = core.getInput('architectures', { required: false }) || 'x86_64';

  return {
    functionDescription,
    packageType,
    dryRun,
    publish,
    revisionId,
    runtime,
    handler,
    architectures
  };
}

function parseJsonInput(jsonString, inputName) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Invalid JSON in ${inputName} input: ${error.message}`);
  }
}

function validateRoleArn(arn) {
  const rolePattern = /^arn:aws(-[a-z0-9-]+)?:iam::[0-9]{12}:role\/[a-zA-Z0-9+=,.@_\/-]+$/;
  
  if (!rolePattern.test(arn)) {
    core.setFailed(`Invalid IAM role ARN format: ${arn}`);
    return false;
  }
  return true;
}

function validateCodeSigningConfigArn(arn) {
  const cscPattern = /^arn:aws(-[a-z0-9-]+)?:lambda:[a-z0-9-]+:[0-9]{12}:code-signing-config:[a-zA-Z0-9-]+$/;

  if (!cscPattern.test(arn)) {
    core.setFailed(`Invalid code signing config ARN format: ${arn}`);
    return false;
  }
  return true;
}

function validateKmsKeyArn(arn) {
  const kmsPattern = /^arn:aws(-[a-z0-9-]+)?:kms:[a-z0-9-]+:[0-9]{12}:key\/[a-zA-Z0-9-]+$/;
  
  if (!kmsPattern.test(arn)) {
    core.setFailed(`Invalid KMS key ARN format: ${arn}`);
    return false;
  }
  return true;
}

function validateAllInputs() {
  const requiredInputs = validateRequiredInputs();
  if (!requiredInputs.valid) {
    return { valid: false };
  }
  
  const numericInputs = validateNumericInputs();
  if (!numericInputs.valid) {
    return { valid: false };
  }
  
  const arnInputs = validateArnInputs();
  if (!arnInputs.valid) {
    return { valid: false };
  }
  
  const jsonInputs = validateJsonInputs();
  if (!jsonInputs.valid) {
    return { valid: false };
  }
  
  const additionalInputs = getAdditionalInputs();
  
  return {
    valid: true,
    ...requiredInputs,
    ...numericInputs,
    ...arnInputs,
    ...jsonInputs,
    ...additionalInputs
  };
}

module.exports = {
  validateAllInputs,
  parseJsonInput,
  validateRoleArn,
  validateCodeSigningConfigArn,
  validateKmsKeyArn,
  getAdditionalInputs
};
