#version 300 es
in vec4 a_position;
in vec4 a_weights;         // 每个顶点4个权重
in uvec4 a_boneNdx;        // 4个骨骼下标
uniform mat4 bones[MAX_BONES];  // 每个骨骼1个矩阵
 
gl_Position = projection * view *
              (a_bones[a_boneNdx[0]] * a_position * a_weight[0] +
               a_bones[a_boneNdx[1]] * a_position * a_weight[1] +
               a_bones[a_boneNdx[2]] * a_position * a_weight[2] +
               a_boneS[a_boneNdx[3]] * a_position * a_weight[3]);