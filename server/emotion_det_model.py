import torch
import torch.nn as nn 
import torchvision.models as models


class LeNet(nn.Module):
    def __init__(self, num_classes=7):
        super(LeNet, self).__init__()
        self.relu = nn.ReLU()
        self.pool = nn.AvgPool2d(kernel_size=(2, 2), stride=(2, 2))
        self.conv1 = nn.Conv2d(
            in_channels=1,
            out_channels=6,
            kernel_size=(5, 5),
            stride=(1, 1),
            padding=(0, 0),
        )
        self.conv2 = nn.Conv2d(
            in_channels=6,
            out_channels=16,
            kernel_size=(5, 5),
            stride=(1, 1),
            padding=(0, 0),
        )
        self.conv3 = nn.Conv2d(
            in_channels=16,
            out_channels=120,
            kernel_size=(5, 5),
            stride=(1, 1),
            padding=(0, 0),
        )
        self.avgpool = nn.AdaptiveAvgPool2d(1)
        self.linear1 = nn.Linear(120, num_classes)

    def forward(self, x):
        x = self.conv1(x)
        x = self.relu(x)
        x = self.pool(x)
        x = self.conv2(x)
        x = self.relu(x)
        x = self.pool(x)
        x = self.conv3(x)
        x = self.relu(x)
        x = self.avgpool(x)
        x = x.reshape(x.shape[0], -1) # num_examples x 120 x 1 x 1 --> num_examples x 120
        x = self.relu(x)
        x = self.linear1(x)
        return x


class ResNet18(nn.Module):

    def __init__(self, num_classes=7):
        super(ResNet18, self).__init__()
        self.resnet18 = models.resnet18(pretrained=True)
        self.resnet18.fc = nn.Linear(in_features=512, out_features=num_classes, bias=True)

    def forward(self, x):
        x = self.resnet18(x)
        return x


def test_resnet18():
    x = torch.randn(64, 3, 224, 224)
    model = ResNet18()
    print(model)
    return model(x)

def test_lenet():
    x = torch.randn(64, 1, 48, 48)
    model = LeNet()
    return model(x)


if __name__ == "__main__":
    out = test_lenet()
    print(out.shape)
    out = test_resnet18()
    print(out.shape)
